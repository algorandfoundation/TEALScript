---
title: "5. Hello World Method"
---

For this tutorial, we are going to write a method and returns `"Hello, NAME"` with `NAME` being an argument to the method.

## Modifying the Contract

```ts
import { Contract } from "@algorandfoundation/tealscript";

// eslint-disable-next-line no-unused-vars
class HelloWorld extends Contract {
  /**
   * @param name The name of the caller
   *
   * @returns A greeting string
   */
  hello(name: string): string {
    return "Hello, " + name;
  }
}
```

## Compile New Contract

To compile the contract, run `npm run build`. This should update all of the files in `contracts/artifacts` and `contracts/clients`

## Template Literals

It should be noted that TEALScript does not currently support string literals. For example, the following syntax is not yet supported: 

```ts
return `Hello, ${name}`
```
