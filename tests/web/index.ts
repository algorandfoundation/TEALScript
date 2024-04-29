import { Project } from 'ts-morph';
import fetch from 'node-fetch';
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
    // In production you'd probably want to serve these files yourself. They are included in npm package.
    // "src/lib/*.ts" is at "node_modules/@algorandfoundation/tealscript/dist/lib/*.ts"
    // "types/global.d.ts" is at "node_modules/@algorandfoundation/tealscript/types/global.d.ts"
    // If you want to use githubusercontent, just make sure you are using the correct commit/version
    const response = await fetch(
      // @ts-expect-error - TEALSCRIPT_REF is defined in webpack config
      // eslint-disable-next-line no-undef
      `https://raw.githubusercontent.com/algorandfoundation/TEALScript/${TEALSCRIPT_REF}/${p}`
    );
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

  document.getElementById('test').innerHTML = `<span style="white-space: pre-wrap" id="teal">${compiler.teal.approval
    .map((a) => a.teal)
    .join('\n')}</span>`;
}

main();
