#!/usr/bin/env node

import path from 'path';
import * as fs from 'fs';
import { ArgumentParser } from 'argparse';

import Compiler from '../lib/compiler';
import 'dotenv/config';
import { VERSION } from '../version';

const parser = new ArgumentParser({
  description: 'Argparse example',
});

parser.add_argument('input', { help: 'TEALScript source file to compile' });
parser.add_argument('output', { help: 'output directory for artifacts' });
parser.add_argument('-v', '--version', { action: 'version', version: VERSION });
parser.add_argument('--disable-warnings', {
  help: 'disables compiler warnings',
  action: 'store_true',
  default: false,
});
parser.add_argument('--unsafe-disable-overflow-checks', {
  help: 'disables overflow checks for ABI uint/ufixed types',
  action: 'store_true',
  default: false,
});

const parsed = parser.parse_args();
const filename = parsed.input;
const content = fs.readFileSync(filename, 'utf-8');

// Output dir for artifacts
const dir = parsed.output;

const options = {
  filename,
  algodPort: process.env.ALGOD_PORT ? Number(process.env.ALGOD_PORT) : undefined,
  algodServer: process.env.ALGOD_SERVER,
  algodToken: process.env.ALGOD_TOKEN,
  disableWarnings: parsed.disable_warnings as boolean,
  disableOverflowChecks: parsed.unsafe_disable_overflow_checks as boolean,
};

const compilers = Compiler.compileAll(content, options);

compilers.forEach(async (compilerPromise) => {
  const compiler = await compilerPromise;

  const { name } = compiler;

  const approvalTealPath = path.join(dir, `${name}.approval.teal`);
  const clearTealPath = path.join(dir, `${name}.clear.teal`);
  const abiPath = path.join(dir, `${name}.abi.json`);
  const appPath = path.join(dir, `${name}.json`);
  const srcmapPath = path.join(dir, `${name}.src_map.json`);

  if (fs.existsSync(approvalTealPath)) fs.rmSync(approvalTealPath);
  if (fs.existsSync(clearTealPath)) fs.rmSync(clearTealPath);
  if (fs.existsSync(abiPath)) fs.rmSync(abiPath);
  if (fs.existsSync(abiPath)) fs.rmSync(appPath);
  if (fs.existsSync(srcmapPath)) fs.rmSync(srcmapPath);

  fs.writeFileSync(approvalTealPath, compiler.approvalProgram());
  fs.writeFileSync(clearTealPath, compiler.clearProgram());
  fs.writeFileSync(abiPath, JSON.stringify(compiler.abi, null, 2));
  fs.writeFileSync(srcmapPath, JSON.stringify(compiler.srcMap, null, 2));
  fs.writeFileSync(appPath, JSON.stringify(compiler.appSpec(), null, 2));
});
