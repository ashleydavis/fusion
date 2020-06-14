import React from 'react';
import { InjectProperty, InjectableClass } from "@codecapers/fusion";
import { IToast } from './services/toast';

@InjectableClass()
class App extends React.Component {

    @InjectProperty("IToast")
    toast!: IToast;

    render() {
        return (
            <div>
                <button
                    style={{
                        width: "500px",
                        height: "100px",
                    }}
                    onClick={() => {
                        this.toast.success("Here's your delicious toast!!");
                    }}
                    >
                    Click me for a nice slice of toast!
                </button>
            </div>
        );
    }
}

export default App;
