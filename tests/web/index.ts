import { Project } from 'ts-morph';
import fetch from 'node-fetch';
import { VERSION } from '../../src/version';
import Compiler from '../../src/lib/compiler';

const CALCULATOR = `import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Calculator extends Contract {
  /**
   * Calculates the sum of two numbers
   *
   * @param a
   * @param b
   * @returns The sum of a and b
   */
  private getSum(a: number, b: number): number {
    return a + b;
  }

  /**
   * Calculates the difference between two numbers
   *
   * @param a
   * @param b
   * @returns The difference between a and b.
   */
  private getDifference(a: number, b: number): number {
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
  // Step One: Create a ts-morph project with an in-memory file system
  const project = new Project({
    // useInMemoryFileSystem must be true in a browser environment
    useInMemoryFileSystem: true,
    // TEALScript requires experimentalDecorators to be enabled
    compilerOptions: { experimentalDecorators: true },
  });

  // Step Two: Add the source to the project
  const srcPath = 'examples/calculator/calculator.algo.ts';
  project.createSourceFile(srcPath, CALCULATOR);

  // Step Three: Add TEALScript files to the project
  const libDir = 'src/lib';

  const indexPath = `${libDir}/index.ts`;
  const typesPath = 'types/global.d.ts';
  const contractPath = `${libDir}/contract.ts`;
  const lsigPath = `${libDir}/lsig.ts`;
  const compilerPath = `${libDir}/compiler.ts`;

  const promises = [indexPath, typesPath, contractPath, lsigPath, compilerPath].map(async (p) => {
    const response = await fetch(`https://raw.githubusercontent.com/algorandfoundation/TEALScript/${VERSION}/${p}`);
    const text = await response.text();
    project.createSourceFile(p, text);
  });

  await Promise.all(promises);

  const compiler = new Compiler({
    srcPath,
    className: 'Calculator',
    project,
    cwd: '/',
  });
  await compiler.compile();
  await compiler.algodCompile();

  document.getElementById('teal').innerHTML = compiler.teal.approval.map((a) => a.teal).join('\n');
  document.getElementById('appspec').innerHTML = JSON.stringify(compiler.appSpec(), null, 2);
}

main();
