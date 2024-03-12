---
title: "3. The Template Contract"
---

By default, the TEALScript template includes a very basic contract that performs some math operations. This page will breakdown the contract and explain what each of the components do and how TEALScript works. 


## Import Contract

```ts
import { Contract } from '@algorandfoundation/tealscript';
```

Here we are simply importing `Contract` from the tealscript npm package. `Contract` is the most important class in TEALScript as every contract written in TEALScript must extend the `Contract` class. Code outside of the `Contract` superclass will not get compiled.

## Class Definition

```ts
// eslint-disable-next-line no-unused-vars
class HelloWorld extends Contract {
```

As mentioned above, every contract must extend `Contract`. You will also notice that there is the ESLint rule, `no-unused-vars` is disabled for this line. ESLint expects every class we define to be used in our codebase. Since we are developing a contract, however, we don't directly use this class in other TypeScript files, thus we expect it to be unused.

## Private Methods

```ts
  /**
   * Calculates the sum of two numbers
   *
   * @param a
   * @param b
   * @returns The sum of a and b
   */
  private getSum(a: uint64, b: uint64): uint64 {
    return a + b;
  }

  /**
   * Calculates the difference between two numbers
   *
   * @param a
   * @param b
   * @returns The difference between a and b.
   */
  private getDifference(a: uint64, b: uint64): uint64 {
    return a >= b ? a - b : b - a;
  }
```

In TypeScript, a private function is a function that can only be called internally by an instance of this class. The `private` keyword in TEALScript has a very similar meaning. If a method is `private`, then nobody can directly call the method. The only way to reach the logic defined in these methods is through a public method that explicitly calls them.

The logic of these methods are rather simple. 

### getSum

Simply adds the two given numbers together/

### getDifference

Will get the difference of the two given numbers by subtracting the smaller one from the bigger one.

## Public Method

```ts
  /**
  * A method that takes two numbers and does either addition or subtraction
  *
  * @param a The first number
  * @param b The second number
  * @param operation The operation to perform. Can be either 'sum' or 'difference'
  *
  * @returns The result of the operation
  */
  doMath(a: uint64, b: uint64, operation: string): uint64 {
    let result: uint64;

    if (operation === 'sum') {
      result = this.getSum(a, b);
    } else if (operation === 'difference') {
      result = this.getDifference(a, b);
    } else throw Error('Invalid operation');

    return result;
  }
```

### doMath

Because this function is public (there is no `private` keyword, thus it is implicitly public), any client on or off chain can call `doMath`. 

As indicating by the TypeDoc comment, this function takes in two numbers and a string as an operation. The `operation` argument is used to determine whether `getSum` or `getDifferent` should be called.

### Errors

If the `operation` string is not an expected operation, the contract will throw an error.

It should be noted that there is no concept of `try` in TEALScript. Errors are unrecoverable and will results in a failed transaction. On Algorand, failed transaction do not get charged a fee.