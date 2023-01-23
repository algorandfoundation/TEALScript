#!/usr/bin/env node

import path from 'path';
import * as fs from 'fs';
import ts from 'typescript';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../lib/compiler';

const filename = process.argv[2];
const content = fs.readFileSync(filename, 'utf-8');
const src = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf-8'), ts.ScriptTarget.ES2019, true);

// Output dir for artifacts
const dir = process.argv.length > 3 ? process.argv[3] : path.dirname(filename);
console.log(process.argv);

src.statements.forEach(async (body) => {
  if (ts.isClassDeclaration(body) && body.heritageClauses?.[0]?.types[0].expression.getText() === 'Contract') {
    const name = body.name!.text;
    const tealPath = path.join(dir, `${name}.teal`);
    const abiPath = path.join(dir, `${name}.abi.json`);
    const appPath = path.join(dir, `${name}.json`);
    const srcmapPath = path.join(dir, `${name}.src_map.json`);

    const compiler = new Compiler(content, name, filename);
    await compiler.compile();

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    if (fs.existsSync(tealPath)) fs.rmSync(tealPath);
    if (fs.existsSync(abiPath)) fs.rmSync(abiPath);
    if (fs.existsSync(abiPath)) fs.rmSync(appPath);
    if (fs.existsSync(srcmapPath)) fs.rmSync(srcmapPath);

    await compiler.algodCompile();

    fs.writeFileSync(tealPath, compiler.prettyTeal());
    fs.writeFileSync(abiPath, JSON.stringify(compiler.abi, null, 2));
    fs.writeFileSync(srcmapPath, JSON.stringify(compiler.pcToLine, null, 2));
    fs.writeFileSync(appPath, JSON.stringify(compiler.appSpec()));
  }
});
