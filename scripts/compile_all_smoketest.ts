// eslint-disable-next-line import/no-extraneous-dependencies
import { globSync } from 'glob';
import { readFileSync } from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { Compiler } from '../src/lib';

const TESTS_PROJECT = new Project({
  tsConfigFilePath: path.join(__dirname, '..', 'tests', 'contracts', 'tsconfig.json'),
});

const EXAMPLES_PROJECT = new Project({
  tsConfigFilePath: path.join(__dirname, '..', 'examples', 'tsconfig.json'),
});

async function main() {
  const files = globSync(path.join(__dirname, '../**/*.algo.ts'));
  files.forEach((file) => {
    if (file.includes('compile_errors')) return;
    const project = file.includes('examples/') ? EXAMPLES_PROJECT : TESTS_PROJECT;
    Compiler.compileAll(readFileSync(file, 'utf-8'), project, { filename: file });
  });
}

await main();
