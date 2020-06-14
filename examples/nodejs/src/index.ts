import { InjectProperty, InjectableClass, InjectableSingleton } from "../../../src/index";

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
        // By the time we get to this code path the logging service has been automatically constructed and injected.
        //
        this.log.info("Hello world!");
    }
    
}

const myObject = new MyClass(); // The logging singleton is lazily created at this point.
myObject.myFunction();
