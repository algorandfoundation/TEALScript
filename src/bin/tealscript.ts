#!/usr/bin/env node

import path from 'path';
import * as fs from 'fs';
import ts from 'typescript';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../lib/compiler';

const filename = process.argv[2];
const content = fs.readFileSync(filename, 'utf-8');
const src = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf-8'), ts.ScriptTarget.ES2019, true);
const dir = path.dirname(filename);

src.statements.forEach(async (body) => {
  if (ts.isClassDeclaration(body) && body.heritageClauses?.[0]?.types[0].expression.getText() === 'Contract') {
    const name = body.name!.text;
    const tealPath = path.join(dir, `${name}.teal`);
    const abiPath = path.join(dir, `${name}.abi.json`);
    const appPath = path.join(dir, `${name}.json`);
    const srcmapPath = path.join(dir, `${name}.src_map.json`);

    if (fs.existsSync(tealPath)) fs.rmSync(tealPath);
    if (fs.existsSync(abiPath)) fs.rmSync(abiPath);
    if (fs.existsSync(abiPath)) fs.rmSync(appPath);
    if (fs.existsSync(srcmapPath)) fs.rmSync(srcmapPath);

    const compiler = new Compiler(content, name, filename);
    await compiler.compile();

    fs.writeFileSync(tealPath, compiler.prettyTeal());
    fs.writeFileSync(abiPath, JSON.stringify(compiler.abi, null, 2));

    await compiler.algodCompile();
    fs.writeFileSync(srcmapPath, JSON.stringify(compiler.pcToLine, null, 2));
    fs.writeFileSync(appPath, JSON.stringify(compiler.appSpec()));
  }
});
