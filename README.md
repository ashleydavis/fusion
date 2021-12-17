# Fusion

A simple automated dependency injection library for TypeScript, supporting React class and functional components.

Learn more about Fusion in this blog post:
- [https://www.the-data-wrangler.com/roll-your-own-di](https://www.the-data-wrangler.com/roll-your-own-di)

If you like this project, please star this repo and [support my work](https://www.codecapers.com.au/about#support-my-work)


# Aims

- To have a simple dependency injection library with minimal configuration that can be used in TypeScript code and with React.

# Features

- Less than 400 lines of code (used to be 300, but you know how it goes, I keep adding extra stuff)
- Configuration via TypeScript decorators.
- Injects properties into generic TypeScript class.
- Injects properties into React class components.
- Injects parameters into React functional components.
  - Unfortuntely decorators can't be applied to global functions (seems like a big thing missing from TypeScript??) - so the injection approach for functional components doesn't use decorators.
- Automated dependency injection. 
  - Just add mark up and let Fusion do the wiring for you.
- Detects and breaks circular references (with an error) at any level of nesting.
  - But only when NODE_ENV is not set to "production" (to make it fast in production).
- Unit tested.

# Examples

See [the `examples` sub-directory](https://github.com/ashleydavis/fusion/tree/master/examples) in this repo for runnable Node.js and React examples.

Read the individual readme files for instructions.

There's also [a separate repo](https://github.com/ashleydavis/fusion-examples) with separate examples for React class components and functional components.

# Usage

First enable decorators in your `tsconfig.json` file:

```json
"experimentalDecorators": true
```

Install the Fusion library:

```bash
npm install --save @codecapers/fusion
```

Import the bits you need:

```typescript
import { InjectProperty, InjectableClass, InjectableSingleton, injectable } from "@codecapers/fusion";
```

## Create dependencies

Create dependencies that can be injected:

### `log.ts`
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

**Note:** if you can't get over the magic string, please skip to the last section!

## Inject properties into classes

Mark up your class to have dependencies injected:

### `my-class.ts`
```typescript
import { InjectProperty, InjectableClass } from "@codecapers/fusion";
import { ILog } from "./log";

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

    // ... Other functions and other stuff ...
}
```

Now instance your injectable class:


```typescript
import { MyClass } from "./my-class";

// The logging singleton is lazily created at this point.
const myObject = new MyClass(); 
```

Injected properties are solved during construction and available for use after the consturctor has returned.

So after your class is constructed you can call functions that rely on injected properties:

```typescript
myObject.myFunction();
```

## Inject parameters into functions 

This can be used for injection into React functional components.

Create a functional component that needs dependencies:

### `my-component.jsx`
```javascript
import React from "react";
import { injectable } from "@codecapers/fusion";

function myComponent(props, context, dependency1, dependency2) {

    // Setup the component, use your dependencies...

    return (
        <div>
            // ... Your JSX goes here ...
        </div>;
    );
}
```

Wrap your functional component in the `injectable` higher order component (HOC):

### `my-component.jsx` (extended)
```javascript
export default injectable(myComponent, ["IDependency1", "IDependency2"]);
```

The exported component will have the dependencies injected as parameters in the order specified (after props and context of course).

## Getting rid of the magic strings

I like to get rid of the magic string by using constants co-located with the dependencies:

### `log.ts`
```javascript
const ILog_id = "ILog";

//
// Interface to the logging service.
//
interface ILog {
    info(msg: string): void;
}

//
// This is a lazily injected singleton that's constructed when it's injected.
//
@InjectableSingleton(ILog_id)
class Log implements ILog {
    info(msg: string): void {
        console.log(msg);
    }
}
```

Then use the constant to identify your dependencies:

### `my-class.ts`
```typescript
@InjectableClass()
class MyClass {

    //
    // Injects the logging service into this property.
    //
    @InjectProperty(ILog_id)
    log!: ILog;

    // ... Other properties and methods ...
}
```


Have fun! There's more to it than this of course, but getting started is that simple.

See [the blog post](https://www.the-data-wrangler.com/roll-your-own-di) to learn more.
