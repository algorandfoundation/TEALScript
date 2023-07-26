# TEALScript

TEALScript is a subset of TypeScript that can be compiled into TEAL. The goal is to enable developers to write Algorand Smart Contracts using native TypeScript syntax. Since TEALScript uses native TypeScript syntax, IDE support works out of the box for any IDE that supports TypeScript.

## Documentation

The documentation for the latest release can be viewed at [tealscript.algo.xyz](https://tealscript.algo.xyz) and can be generated locally with `yarn docs`

## Status

TEALScript is still very much a work in progress. The current version is `0.x.x`. This means there will be frequent changes being made, including breaking changes, without incrementing the MAJOR version number. As such, it is currently not recommended to use TEALScript in production.

## Example Contract

The artifacts for this contract can be seen in [examples/calculator/artifacts](./examples/calculator/artifacts). Note that the TypeDoc comment is used when generating [the ABI JSON](./examples/calculator/artifacts/Calculator.abi.json)

```ts
import { Contract } from '../../src/lib/index';

class Calculator extends Contract {
  private getSum(a: number, b: number): number {
    return a + b;
  }

  private getDifference(a: number, b: number): number {
    return a >= b ? a - b : b - a;
  }

  /**
  * A method that takes two numbers and does either addition or subtraction
  *
  * @param a - The first number
  * @param b - The second number
  * @param operation - The operation to perform. Can be either 'sum' or 'difference'
  *
  * @returns The result of the operation
  */
  doMath(a: number, b: number, operation: string): number {
    let result: number;

    if (operation === 'sum') {
      result = this.getSum(a, b);
    } else if (operation === 'difference') {
      result = this.getDifference(a, b);
    } else throw Error('Invalid operation');

    return result;
  }
}

```
