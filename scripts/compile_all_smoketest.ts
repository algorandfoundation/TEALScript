// eslint-disable-next-line import/no-extraneous-dependencies
import { globSync } from 'glob';
import { readFileSync } from 'fs';
import { Compiler } from '../src/lib';

async function main() {
  const files = globSync('../**/*.algo.ts');
  files.forEach((file) => {
    if (file.includes('compile_errors')) return;
    Compiler.compileAll(readFileSync(file, 'utf-8'), { filename: file });
  });
}

await main();
