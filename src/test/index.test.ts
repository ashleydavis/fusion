import { InjectProperty, InjectableClass, registerSingleton, InjectableSingleton, instantiateSingleton, setLogger, disableInjector, enableInjector, enableVerbose } from "..";

describe("fusion", () => {

    setLogger({
        info: () => {},
        error: () => {},
    });

    it("can construct injectable class", ()  => {

        @InjectableClass()
        class MyClass {
        }

        expect(new MyClass()).toBeDefined();
    });

    it("can inject property dependency", ()  => {

        interface IMyDependency {

        }

        class MyDependency implements IMyDependency {
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("IMyDependency")
            dep!: IMyDependency;
        }

        const theDependency = new MyDependency();
        registerSingleton("IMyDependency", theDependency);

        expect(new MyClass().dep).toBe(theDependency);
    });

    it("can inject two property dependencies", ()  => {

        interface IMyDependency1 {
        }

        class MyDependency1 implements IMyDependency1 {
        }

        interface IMyDependency2 {
        }

        class MyDependency2 implements IMyDependency2 {
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("IMyDependency1")
            dep1!: IMyDependency1;

            @InjectProperty("IMyDependency2")
            dep2!: IMyDependency2;
        }

        const theDependency1 = new MyDependency1();
        registerSingleton("IMyDependency1", theDependency1);

        const theDependency2 = new MyDependency2();
        registerSingleton("IMyDependency2", theDependency2);
        
        const theInstance = new MyClass();
        expect(theInstance.dep1).toBe(theDependency1);
        expect(theInstance.dep2).toBe(theDependency2);
    });

    it("can disable injector", ()  => {

        disableInjector();

        interface IMyDependency {
        }

        class MyDependency implements IMyDependency {
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("IMyDependency")
            dep!: IMyDependency;
        }

        const theDependency = new MyDependency();
        registerSingleton("IMyDependency", theDependency);

        const theInstance = new MyClass();

        enableInjector();

        expect(theInstance.dep).toBeUndefined();

    });

    it("throws when property dependency is not found", ()  => {

        interface IMyDependency {
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("A-dependency-that-does-not-exist")
            dep!: IMyDependency;
        }

        expect(() => new MyClass()).toThrowError();
    });

    it("can lazily instantiate and inject singleton", ()  => {

        interface IMySingleton1 {
        }

        let numInstances = 0;

        @InjectableSingleton("IMySingleton1")
        class MySingleton1 implements IMySingleton1 {
            constructor() {
                ++numInstances;
            }
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("IMySingleton1")
            dep!: IMySingleton1;
        }

        expect(new MyClass().dep).toBeDefined();
        expect(numInstances).toBe(1);
    });

    it("singleton is only instantiated once", ()  => {

        interface IMySingleton2 {
        }

        let numInstances = 0;

        @InjectableSingleton("IMySingleton2")
        class MySingleton2 implements IMySingleton2 {
            constructor() {
                ++numInstances;
            }
        }

        @InjectableClass()
        class MyClass1 {
            @InjectProperty("IMySingleton2")
            dep!: IMySingleton2;
        }

        @InjectableClass()
        class MyClass2 {
            @InjectProperty("IMySingleton2")
            dep!: IMySingleton2;
        }

        const theInstance1 = new MyClass1();
        expect(theInstance1.dep).toBeDefined();

        const theInstance2 = new MyClass1();
        expect(theInstance2.dep).toBe(theInstance1.dep);
        expect(numInstances).toBe(1);
    });

    it("throws when singleton constructor throws", ()  => {

        interface IMySingleton3 {
        }

        @InjectableSingleton("IMySingleton3")
        class MySingleton3 implements IMySingleton3 {
            constructor() {
                throw new Error("An error!");
            }
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("IMySingleton3")
            dep!: IMySingleton3;
        }

        expect(() => new MyClass()).toThrow();
    });

    it("can manually instantiate singleton", ()  => {

        interface IMySingleton4 {
        }

        let numInstances = 0;

        @InjectableSingleton("IMySingleton4")
        class MySingleton4 implements IMySingleton4 {
            constructor() {
                ++numInstances;
            }
        }

        expect(instantiateSingleton("IMySingleton4")).toBeDefined();
        expect(numInstances).toBe(1);
    });

    it("throws error for circular dependency", ()  => {

        interface IMySingleton5 {
        }

        @InjectableSingleton("IMySingleton5")
        class MySingleton5 implements IMySingleton5 {
            @InjectProperty("MySingleton7")
            dep1!: MySingleton7;
        }

        interface IMySingleton6 {
        }

        @InjectableSingleton("IMySingleton6")
        class MySingleton6 implements IMySingleton6 {
            @InjectProperty("IMySingleton5")
            dep1!: IMySingleton5;
        }

        interface IMySingleton7 {
        }

        @InjectableSingleton("IMySingleton7")
        class MySingleton7 implements IMySingleton7 {
            @InjectProperty("IMySingleton6")
            dep1!: IMySingleton6;
        }

        @InjectableClass()
        class MyClass {
            @InjectProperty("IMySingleton7")
            dep!: IMySingleton7;
        }

        expect(() => new MyClass()).toThrowError();
    });

    it("can enable and disable verbose logging", () => { 
        enableVerbose(true);
        enableVerbose(false);
    });

});
