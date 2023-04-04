import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Calculator extends Contract {
  private getSum(a: number, b: number): number {
    return a + b;
  }

  private getDifference(a: number, b: number): number {
    return a >= b ? a - b : b - a;
  }

  doMath(a: number, b: number, operation: string): number {
    if (operation === 'sum') {
      return this.getSum(a, b);
    } if (operation === 'difference') {
      return this.getDifference(a, b);
    } throw Error('Invalid operation');
  }
}
