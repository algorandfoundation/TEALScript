#!/usr/bin/env node

import path from 'path';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as parser from '@typescript-eslint/typescript-estree';
import * as fs from 'fs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../lib/compiler';

const filename = process.argv[2];
const content = fs.readFileSync(filename, 'utf-8');
const tree = parser.parse(content, { range: true, loc: true });
const dir = path.dirname(filename);

tree.body.forEach(async (body: any) => {
  if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract') {
    const tealPath = path.join(dir, `${body.id.name}.teal`);
    const abiPath = path.join(dir, `${body.id.name}.abi.json`);
    const srcmapPath = path.join(dir, `${body.id.name}.src_map.json`);

    if (fs.existsSync(tealPath)) fs.rmSync(tealPath);
    if (fs.existsSync(abiPath)) fs.rmSync(abiPath);
    if (fs.existsSync(srcmapPath)) fs.rmSync(srcmapPath);

    const compiler = new Compiler(content, body.id.name, filename);
    await compiler.compile();

    fs.writeFileSync(tealPath, compiler.prettyTeal());
    fs.writeFileSync(abiPath, JSON.stringify(compiler.abi, null, 2));

    await compiler.algodCompile();
    fs.writeFileSync(srcmapPath, JSON.stringify(compiler.pcToLine, null, 2));
  }
});
