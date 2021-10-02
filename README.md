# Fusion

A simple automated dependency injection (DI) library for TypeScript that can be used with React.

Learn more about Fusion in this blog post:
- [https://www.the-data-wrangler.com/roll-your-own-di](https://www.the-data-wrangler.com/roll-your-own-di)

If you like this project, please star this repo and [Click here to support my work](https://www.codecapers.com.au/about#support-my-work)


# Aims

- To have a simple dependency injection library with minimal configuration that can be used in TypeScript code and with React.

# Features

- Less than 300 lines of code.
- Configuration via TypeScript decorators.
- Automated dependency injection. Just add mark up and let the library do the wiring for you.
- Uses TypeScript decorators to:
    - Mark classes for injection.
    - Mark properties for injection.
    - Mark singletons for lazy creation and injection.
- Can detect and break circular references (with an error) at any level of nesting.
- Unit tested.
- Automatically detects circular dependencies when NODE_ENV is not set to "production".

# Examples

See the examples sub-directory for runnable Node.js and React examples.

Read the individual readme files for instructions.

# Usage

First enable decorators in your `tsconfig.json` file:

```json
    "experimentalDecorators": true
```

Install it:

```bash
npm install --save @codecapers/fusion
```

Import the bits you need:

```typescript
import { InjectProperty, InjectableClass, InjectableSingleton } from "@codecapers/fusion";
```

Create dependencies that can be injected:

```typescript
//
// Interface to the logging service.
//
interface ILog {
    info(msg: string): void;
}

//
// This is a lazily injected singleton that's constructed when it's injected.
//
@InjectableSingleton("ILog")
class Log implements ILog {
    info(msg: string): void {
        console.log(msg);
    }
}
```

Mark up your class to have dependencies injected:

```typescript
@InjectableClass()
class MyClass {

    //
    // Injects the logging service into this property.
    //
    @InjectProperty("ILog")
    log!: ILog;

    myFunction() {
        //
        // Use the injected logging service.
        // By the time we get to this code path the logging service 
        // has been automatically constructed and injected.
        //
        this.log.info("Hello world!");
    }
    
}
```

Now instance your injectable class:

```typescript
// The logging singleton is lazily created at this point.
const myObject = new MyClass(); 
```

Injected properties are solved during constructor after the constructor of class has been called.

So after your class is constructed you can call functions that rely on injected properties:

```typescript
myObject.myFunction();
```

Have fun! There's more to it than this of course, but getting started is that simple.

Stay tuned, a blog post and more docs are coming soon.

