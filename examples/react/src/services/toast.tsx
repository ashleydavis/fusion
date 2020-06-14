import { InjectableSingleton } from "@codecapers/fusion";

//
// Interface to the toast service.
//
export interface IToast {
    success(msg: string): void;
}

//
// This is a lazily injected singleton that's constructed just before it's injected.
//
@InjectableSingleton("IToast")
export class Toast implements IToast {
    success(msg: string): void {
        alert(msg);
    }
}
