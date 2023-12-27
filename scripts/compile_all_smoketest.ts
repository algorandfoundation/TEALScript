// eslint-disable-next-line import/no-extraneous-dependencies
import { globSync } from 'glob';
import { readFileSync } from 'fs';
import { Project } from 'ts-morph';
import path from 'path';
import ts from 'typescript';
import { Compiler } from '../src/lib';

async function main() {
  const files = globSync(path.join(__dirname, '../**/*.algo.ts'));
  files.forEach((file) => {
    if (file.includes('compile_errors')) return;
    const tsConfigFilePath = ts.findConfigFile(file, ts.sys.fileExists, 'tsconfig.json');

    const project = new Project({
      tsConfigFilePath,
    });
    Compiler.compileAll(readFileSync(file, 'utf-8'), project, { filename: file });
  });
}

await main();
