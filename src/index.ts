//
// Allows the automated injector to be enabled/disabled, good for automated testing where you want to manually do the injection.
//
let injectorEnabled = true;

//
// Allows automatic singletons to be enabled/disabled.
//
let automaticSingletons = true;

//
// Allows checking for circular dependencies (there's a performance cost to this, so only enabled on request).
//
let enableCircularCheck = false;

//
// Enables automatic singleons.
//
export function enableAutomaticSingletons(): void {
    automaticSingletons = true;
}

//
// Disables automatic singleons.
//
export function disableAutomaticSingletons(): void {
    automaticSingletons = false;
}

//
// Enables circular dependency checking.
//
export function enableCircularDependencyCheck() {
    enableCircularCheck = true;
}

//
// Disables circular dependency checking.
//
export function disableCircularDependencyCheck() {
    enableCircularCheck = false;
}

//
// Enable the injector.
//
export function enableInjector(): void {
    injectorEnabled = true;
}

//
// Disable the injector.
//
export function disableInjector(): void {
    injectorEnabled = false;
}

//
// Enable or disable verbose mode which is good for debugging.
//
export function enableVerbose(enable: boolean): void {
    verbose = enable;
}

//
// Interface to the logger.
//
export interface ILog {
    //
    // Log an information message.
    //
    info(msg: string): void;

    //
    // Log an error.
    //
    error(err: string): void;
}

let log: ILog = {
    //
    // Log an information message.
    //
    info(msg: string): void {
        console.log(msg);
    },

    //
    // Log an error.
    //
    error(msg: string): void {
        console.error(msg);
    },
};

//
// Set a new logger.
//
export function setLogger(newLog: ILog) {
    log = newLog;
}

//
// Constructors that can be called to instantiate singletons.
//
const singletonConstructors = new Map<string, Function>();

//
// Collection of all singletons objects that can be injected.
//
const instantiatedSingletons = new Map<string, any>();

//
// What is currently being injected.
// This allows us to deals with circular dependencies.
// This is only enabled when NODE_ENV is not equal to "production".
//
const injectionMap = new Set<number>();

//
// Stack of constructor names.
// Available when verbose mode is enabled.
//
const constructorStack: string[] = [];

//
// Set to true to enable verbose mode.
//
let verbose: boolean = false;

//
// Manually registers a singleton.
//
export function registerSingleton(dependencyId: string, singleton: any): void {
    if (verbose) {
        log.info("@@@@ Manually registered singleton: " + dependencyId);
    }

    instantiatedSingletons.set(dependencyId, singleton);
}

//
// Register many singletons at once.
//
export function registerSingletons(singletons: any): void {
    for (const [name, singleton] of Object.entries(singletons)) {
        registerSingleton(name, singleton);
    }
}

//
// Clear all singletons. Useful for testing.
//
export function clearSingletons(): void {
    instantiatedSingletons.clear();
}

let nextConstructorId = 1;

//
// Takes a constructor and makes it 'injectable'.
// Wraps the constructor in a proxy that handles injecting dependencies.
//
function makeConstructorInjectable(origConstructor: Function): Function {
    if (verbose) {
        log.info("@@@@ Making constructor injectable: " + origConstructor.name);
    }

    if (origConstructor.prototype.__id__ !== undefined) {
        throw new Error(`Constructor ${origConstructor.name} has already been made injectable with id ${origConstructor.prototype.__id__}.`);
    }

    origConstructor.prototype.__id__ = nextConstructorId++;

    if (!origConstructor.prototype.__injections__) {
        // Record properties to be injected against the constructor prototype.
        origConstructor.prototype.__injections__ = []; 
    }

    const proxyHandler = {
        construct(target: any, args: any[], newTarget: any) {
            
            if (verbose) {
                log.info("++++ Proxy constructor for injectable class: " + origConstructor.name);

                constructorStack.push(origConstructor.name);
            }

            try {
                // 
                // Construct the object ...
                //
                const obj = Reflect.construct(target, args, newTarget);

                if (injectorEnabled) {
                    try {
                        //
                        // ... and then resolve property dependencies.
                        //
                        resolvePropertyDependencies(origConstructor.prototype.__id__, origConstructor.name, obj, origConstructor.prototype.__injections__);
                    }
                    catch (err) {
                        log.error(`Failed to construct ${origConstructor.name} due to exception thrown by ${resolvePropertyDependencies.name}.`);
                        throw err;
                    }
                }

                return obj;
            }
            finally {
                if (verbose) {
                    constructorStack.pop();
                }
            }
        }
    };

    // Wrap the original constructor in a proxy.
    // Use the proxy to inject dependencies.
    // Returns the proxy constructor to use in place of the original constructor.
    return new Proxy(origConstructor, proxyHandler);
}

//
// Returns true if a singleton is registered.
//
export function isSingletonRegistered(dependencyId: string): boolean {
    return singletonConstructors.has(dependencyId);
}

//
// Returns true if a singleton is instantiated.
//
export function isSingletonInstantiated(dependencyId: string): boolean {
    return instantiatedSingletons.has(dependencyId);
}

//
// Instantiates a singleton.
// If it's already instantiated then the original is returned instead.
//
export function instantiateSingleton<T = any>(dependencyId: string): T {
    if (verbose) {
        log.info("<<< Requesting singleton: " + dependencyId);
    }

    try {
        const existingSingleton = instantiatedSingletons.get(dependencyId);
        if (existingSingleton) {
            if (verbose) {
                log.info("= Singleton already exists: " + dependencyId);
            }
            // The singleton has previously been instantiated.
            return existingSingleton;
        }
    
        const singletonConstructor = singletonConstructors.get(dependencyId);
        if (!singletonConstructor) {
            // The requested constructor was not found. 
            let msg = "No constructor found for singleton " + dependencyId;
            if (constructorStack.length > 0) {
                msg += `\r\nConstructor stack: ${constructorStack.join(" -> ")}`;
            }
            log.error(msg);
            log.info("Available constructors: \r\n" +
                Array.from(singletonConstructors.entries())
                    .map(entry => 
                        "\t" + entry[0] + " -> " + entry[1].name
                    )
                    .join("\r\n")
            );
            throw new Error(msg);
        }
    
        if (verbose) {
            log.info("= Lazily instantiating singleton: " + dependencyId);
        }
        
        // Construct the singleton.
        const instantiatedSingleton = Reflect.construct(singletonConstructor, []);

        // Cache the instantiated singleton for later reuse.
        instantiatedSingletons.set(dependencyId, instantiatedSingleton);
        if (verbose) {
            log.info("= Lazily instantiated singleton: " + dependencyId);
        }
        return instantiatedSingleton;
    }
    catch (err) {
        log.error("Failed to instantiate singleton " + dependencyId);
        log.error(err && err.stack || err);
        throw err;
    }
}

//
// Resolve dependencies for properties of an instantiated object.
//
function resolvePropertyDependencies(constructorId: number, constructorName: string, obj: any, injections: any[]): void {

    if (verbose) {
        log.info(`>>>> Resolving dependencies for new instance of ${constructorName}.`);
    }

    if (injections) {
        if (enableCircularCheck) {
            if (injectionMap.has(constructorId)) {
                throw new Error(`${constructorName} has already been injected, this exception breaks a circular reference that would crash the app.`);
            }

            injectionMap.add(constructorId);
        }

        try {

            for (const injection of injections) {
                const dependencyId = injection[1];
                
                if (verbose) {
                    log.info(">>>> Injecting " + dependencyId);
                }
    
                const singleton = instantiateSingleton(dependencyId);
                if (!singleton) {
                    throw new Error("Failed to instantiate singleton " + dependencyId);
                }
    
                obj[injection[0]] = singleton;
            }
        }
        finally {
            if (enableCircularCheck) {
                injectionMap.delete(constructorId);
            }
        }
    }
}

//
// TypeScript decorator:
// Marks a class as an automatically created singleton that's available for injection.
// Makes a singleton available for injection.
//
export function InjectableSingleton(dependencyId: string): Function {
    if (verbose) {
        log.info("@@@@ Registering singleton " + dependencyId);
    }

    // Returns a factory function that records the constructor of the class so that
    // it can be lazily created later as as a singleton when required as a dependency.
    return (origConstructor: Function): Function => {
        if (verbose) {
            log.info("@@@@ Caching constructor for singleton: " + dependencyId);
        }

        const injectableConstructor = makeConstructorInjectable(origConstructor);

        // Adds the target constructor to the set of lazily createable singletons.
        if (automaticSingletons) {
            singletonConstructors.set(dependencyId, injectableConstructor);
        }

        return injectableConstructor;
    }
}

//
// TypeScript decorator:
// Marks a class as injectable.
// Not require for singletons, they are automatically injectable.
//
export function InjectableClass(): Function {
    // Returns a factory function that creates a proxy constructor.
    return makeConstructorInjectable;
}

//
// TypeScript decorator:
// Injects a dependency to a property.
//
export function InjectProperty(dependencyId: string): Function {
    // Returns a function that is invoked for the property that is to be injected.
    return (prototype: any, propertyName: string): void => {
        if (verbose) {
            log.info("@@@@ Setup to inject " + dependencyId + " to property " + propertyName + " in " + prototype.constructor.name);
        }

        if (!prototype.__injections__) {
            // Record properties to be injected against the constructor prototype.
            prototype.__injections__ = []; 
        }

        // Record injections to be resolved later when an instance is created.
        prototype.__injections__.push([propertyName, dependencyId]);
    };
}

//
// Injects a list of dependencies into a function.
//
export function injectable(fn: Function, dependencyIds: string []) {
    return (...args: any) => {
        return fn(
            ...args, 
            ...dependencyIds.map(id => instantiateSingleton(id))
        );
    };
}
