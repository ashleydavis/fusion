# typescript-template

A template for a TypeScript app. To make it easier to start a new app without having to go through all the configuration.

## Features

- Example module.
- Example command line app (installable via npm install -g)
- Testing using Jest.
- Linting using tslint.
- Debugging setup for VS Code.

## Usage

When you want to start a new TypeScript app:

- Copy this repo
- Search and replace 'typescript-template' to 'your-module-name' across the entire repo
- Install your own custom dependencies
- Add your custom code.
- Add to your own Github or Bitbucket repo (you can npm install from a Git repo! Even a private one!)
- If necessary, publish to npm using `npm publish`.

You now have a reusable code module and/or command line app that you can 'npm install' and share with your team mates.

## Get the code

Clone or download and unpack the repo.

Install local dependencies

    cd your-module-name
    npm install

## Installation

Once you publish you can install via npm and use it from TypeScript or JavaScript or from the command line.

### From code

Import and use it (in a TypeScript file):

```typescript
import { ExampleClass } from 'your-module-name';

var example = new ExampleClass();
console.log(example.returnsTrue());
```

Import and use it (from JavaScript):

```javascript
var yourModule = require('your-module-name');
var ExampleClass = yourModule.ExampleClass;

var example = new ExampleClass();
console.log(example.returnsTrue());
```

### From command line

You can also run your published module as a command line app.

For example, install it globally:

    npm install -g your-module-name

Then run it:

    your-module-name-cli [args]

## Building the code

Open folder in Visual Studio Code and hit Ctrl+Shift+B

Or

    cd typescript-template
    npm run build

## Debugging

- Open in Visual Studio Code.
- Select 'Main' debug configuration.
- Select the 'Test All' or 'Test Current' debug configuration to debug all tests or the current test file.
- Set your breakpoints.
- Hit F5 to run.

## Build and run

Compile the application:

    npm run build

The run the compiled JavaScript:

    npm start

## Running without building

Run the command line app directly:

    npm start:dev

Run tests directly:

    npm test

Or:

    npm run test:watch


**Checkout** package.json for more scripts!