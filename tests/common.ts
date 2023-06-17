/* eslint-disable mocha/no-exports */
/* eslint-disable mocha/no-mocha-arrows */
/* eslint-disable func-names */

import fs from 'fs';
import { expect } from 'chai';
import algosdk from 'algosdk';
import Compiler from '../src/lib/compiler';

export const indexerClient = new algosdk.Indexer('a'.repeat(64), 'http://localhost', 8980);
export const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);

export async function getMethodTeal(
  filename: string,
  className: string,
  methodName: string,
): Promise<string[]> {
  const compiler = new Compiler(fs.readFileSync(filename, 'utf-8'), className);
  await compiler.compile();
  const { teal } = compiler;

  const labelIndex = teal.indexOf(`${methodName}:`);
  const retsubIndex = teal.indexOf('retsub', labelIndex);
  return teal.slice(labelIndex + 2, retsubIndex);
}

export function lowerFirstChar(str: string) {
  return `${str.charAt(0).toLocaleLowerCase() + str.slice(1)}`;
}

export function artifactsTest(
  testName: string,
  sourcePath: string,
  artifactsPath: string,
  className: string,
) {
  describe(`${testName} ${className} Artifacts`, () => {
    before(async function () {
      const content = fs.readFileSync(sourcePath, 'utf-8');
      this.compiler = new Compiler(content, className, sourcePath);
      await this.compiler.compile();
      await this.compiler.algodCompile();
    });

    it('Generates TEAL', function () {
      expect(this.compiler.approvalProgram()).to.equal(fs.readFileSync(`${artifactsPath}/${className}.approval.teal`, 'utf-8'));
    });

    it('Generates Sourcemap', function () {
      expect(this.compiler.pcToLine).to.deep.equal(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.src_map.json`, 'utf-8')));
    });

    it('Generates ABI JSON', function () {
      expect(this.compiler.abi).to.deep.equal(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.abi.json`, 'utf-8')));
    });

    it('Generates App Spec', function () {
      expect(this.compiler.appSpec()).to.deep.equal(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.json`, 'utf-8')));
    });
  });
}
