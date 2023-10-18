/* eslint-disable func-names */

import fs from 'fs';
import algosdk from 'algosdk';
import {
  expect, describe, test, beforeAll,
} from '@jest/globals';
import Compiler from '../src/lib/compiler';

export const indexerClient = new algosdk.Indexer('a'.repeat(64), 'http://localhost', 8980);
export const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
export const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

export async function getMethodTeal(
  filename: string,
  className: string,
  methodName: string,
): Promise<string[]> {
  const compiler = new Compiler(fs.readFileSync(filename, 'utf-8'), className, { disableWarnings: true });
  await compiler.compile();
  const { approvalTeal: teal } = compiler;

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
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const compiler = new Compiler(
    content,
    className,
    { filename: sourcePath, disableWarnings: true },
  );
  describe(`${testName} ${className} Artifacts`, () => {
    beforeAll(async () => {
      await compiler.compile();
      await compiler.algodCompile();
    });

    test('Generates TEAL', () => {
      expect(compiler.approvalTeal.map((t) => t.teal).join('\n')).toEqual(fs.readFileSync(`${artifactsPath}/${className}.approval.teal`, 'utf-8'));
    });

    test('Generates ABI JSON', () => {
      expect(compiler.abi).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.abi.json`, 'utf-8')));
    });

    test('Generates App Spec', () => {
      expect(compiler.appSpec()).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.json`, 'utf-8')));
    });
  });
}
