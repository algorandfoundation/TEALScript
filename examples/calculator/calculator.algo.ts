import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
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
