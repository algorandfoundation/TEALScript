import Compiler from '../../src/lib/compiler';

const CALCULATOR = `import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Calculator extends Contract {
  private getSum(a: number, b: number): number {
    return a + b;
  }

  private getDifference(a: number, b: number): number {
    return a >= b ? a - b : b - a;
  }

  doMath(a: number, b: number, operation: string): number {
    let result: number;

    if (operation === 'sum') {
      result = this.getSum(a, b);
    } else if (operation === 'difference') {
      result = this.getDifference(a, b);
    } else throw Error('Invalid operation');

    return result;
  }
}`;

async function main() {
  const compiler = new Compiler(CALCULATOR, 'Calculator', { disableWarnings: true });
  await compiler.compile();
  await compiler.algodCompile();
  await compiler.appSpec();
}

main();
