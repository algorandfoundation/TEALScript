#!/usr/bin/env node

import path from 'path';
import * as fs from 'fs';
import { ArgumentParser } from 'argparse';
import ts from 'typescript';
import { Project } from 'ts-morph';
import { globSync } from 'glob';
import Compiler from '../lib/compiler';

import 'dotenv/config';
import { VERSION } from '../version';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processFile(filename: string, parsed: any) {
  // Output dir for artifacts
  const dir = parsed.output;

  const tsConfigFilePath = path.join(process.cwd(), ts.findConfigFile(filename, ts.sys.fileExists, 'tsconfig.json')!);

  const project = new Project({
    tsConfigFilePath,
  });

  if (project.getCompilerOptions().experimentalDecorators !== true) {
    // eslint-disable-next-line no-console
    console.warn(
      `WARNING: 'experimentalDecorators' is not enabled in your tsconfig.json. TEALScript is manually overriding this option (in memory) for compilation. This will slightly increase the TEALSCript compile time. Please set 'experimentalDecorators' to 'true' in ${tsConfigFilePath}.`
    );
    project.compilerOptions.set({ experimentalDecorators: true });
  }

  const options = {
    algodPort: process.env.ALGOD_PORT ? Number(process.env.ALGOD_PORT) : undefined,
    algodServer: process.env.ALGOD_SERVER,
    algodToken: process.env.ALGOD_TOKEN,
    disableWarnings: parsed.disable_warnings as boolean,
    disableOverflowChecks: parsed.unsafe_disable_overflow_checks as boolean,
    disableTypeScript: parsed.unsafe_disable_typescript as boolean,
    srcPath: filename,
    project,
    cwd: process.cwd(),
    skipAlgod: parsed.skip_algod as boolean,
  };

  const compilers = Compiler.compileAll(options);

  compilers.forEach(async (compilerPromise) => {
    const compiler = await compilerPromise;

    const { name } = compiler;

    const approvalPath = path.join(dir, `${name}.approval.teal`);
    const clearPath = path.join(dir, `${name}.clear.teal`);
    const abiPath = path.join(dir, `${name}.arc4.json`);
    const appPath = path.join(dir, `${name}.arc32.json`);
    const srcmapPath = path.join(dir, `${name}.src_map.json`);
    const lsigPath = path.join(dir, `${name}.lsig.teal`);
    const arc56Path = path.join(dir, `${name}.arc56.json`);

    if (fs.existsSync(approvalPath)) fs.rmSync(approvalPath);
    if (fs.existsSync(clearPath)) fs.rmSync(clearPath);
    if (fs.existsSync(abiPath)) fs.rmSync(abiPath);
    if (fs.existsSync(appPath)) fs.rmSync(appPath);
    if (fs.existsSync(srcmapPath)) fs.rmSync(srcmapPath);
    if (fs.existsSync(lsigPath)) fs.rmSync(lsigPath);
    if (fs.existsSync(arc56Path)) fs.rmSync(arc56Path);

    if (compiler.teal.lsig.length > 0) {
      fs.writeFileSync(lsigPath, compiler.teal.lsig.map((t) => t.teal).join('\n'));
      fs.writeFileSync(srcmapPath, JSON.stringify(compiler.sourceInfo, null, 2));
      return;
    }

    fs.writeFileSync(approvalPath, compiler.teal.approval.map((t) => t.teal).join('\n'));
    fs.writeFileSync(clearPath, compiler.teal.clear.map((t) => t.teal).join('\n'));
    fs.writeFileSync(abiPath, JSON.stringify(compiler.arc4Description(), null, 2));
    fs.writeFileSync(srcmapPath, JSON.stringify(compiler.sourceInfo, null, 2));
    fs.writeFileSync(appPath, JSON.stringify(compiler.arc32Description(), null, 2));
    fs.writeFileSync(arc56Path, JSON.stringify(compiler.arc56Description(), null, 2));
  });
}

const parser = new ArgumentParser({
  description: 'Argparse example',
});

parser.add_argument('input', { help: 'TEALScript source file(s) to compile', nargs: '*' });
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
parser.add_argument('--unsafe-disable-typescript', {
  help: 'disables typescript diagnostics',
  action: 'store_true',
  default: false,
});
parser.add_argument('--skip-algod', {
  help: 'Skip algod compilation. This results in no source mapping and no algod assebmler error checking. The emitted TEAL may not properly compile without additional steps.',
  action: 'store_true',
  default: false,
});

const parsed = parser.parse_args();

parsed.input.forEach((f: string) =>
  globSync(f).forEach((gf) => {
    processFile(gf, parsed);
  })
);
