# TEALScript

TEALScript is a subset of TypeScript that can be compiled into TEAL. The goal is to enable developers to write Algorand Smart Contracts using native TypeScript syntax. Since TEALScript uses native TypeScript syntax, IDE support works out of the box for any IDE that supports TypeScript.

## Status

TEALScript is a work in progress and not production-ready. The current version is `0.x.x`. This means there will be frequent changes being made, including breaking changes, without incrementing the MAJOR version number.

## Documentation

The documentation for the latest release can be viewed at [tealscript.algo.xyz](https://tealscript.algo.xyz) and can be generated locally with `yarn docs`

## Example Contract

The artifacts for this contract can be seen in [examples/calculator/artifacts](https://github.com/algorandfoundation/TEALScript/tree/dev/examples/calculator/artifacts). Note that the TypeDoc comment is used when generating [the ABI JSON](https://github.com/algorandfoundation/TEALScript/tree/dev/examples/calculator/artifacts/Calculator.abi.json)

```ts
import { Contract } from '../../src/lib/index';

class Calculator extends Contract {
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
}
```

## Differences from TypeScript

While TEALScript is a subset of TypeScript, it does function differently in some cases.

### Types Affect Behavior

In TypeScript, using types, `as` expressions, or type arguments don't affect the compiled JS. In TEALScript, however, types fundamentally change the compiled TEAL. 

For example, the literal expression `1` results in `int 1` in TEAL, but `1 as uint8` results in `byte 0x01`. This also means that arithmetic is done differently on these numbers and they have different overflow protections.

### Numbers Can Be Bigger

In TypeScript, numeric literals with absolute values equal to 2^53 or greater are too large to be represented accurately as integers. In TEALScript, however, numeric literals can be much larger (up to 2^512) if properly type casted as `uint512`.

### Types May Be Required

All JavaScript is valid TypeScript, but that is not the case with TEALScript. In certain cases, types are required and the compiler will throw an error if they are missing. For example, types are always required when defining a method or when defining an array.

