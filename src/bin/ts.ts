#!/usr/bin/env node

import * as fs from 'fs';
import * as ts from 'typescript';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../lib/tscompiler';

const filename = process.argv[2];
// eslint-disable-next-line max-len
const sourceFile = ts.createSourceFile(filename, fs.readFileSync(filename).toString(), ts.ScriptTarget.ES2015, true);

const c = new Compiler(sourceFile);
console.log(c);
