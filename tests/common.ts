/* eslint-disable func-names */

import fs from 'fs';
import algosdk from 'algosdk';
import { expect, describe, test, beforeAll } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
// eslint-disable-next-line import/no-unresolved
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import * as ts from 'ts-morph';
import path from 'path';
import Compiler from '../src/lib/compiler';

export const indexerClient = new algosdk.Indexer('a'.repeat(64), 'http://localhost', 8980);
export const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
export const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

export const TESTS_PROJECT = new ts.Project({ tsConfigFilePath: path.join(__dirname, 'contracts', 'tsconfig.json') });
export const EXAMPLES_PROJECT = new ts.Project({
  tsConfigFilePath: path.join(__dirname, '..', 'examples', 'tsconfig.json'),
});

export async function getMethodTeal(filename: string, className: string, methodName: string): Promise<string[]> {
  const compiler = new Compiler({
    disableWarnings: true,
    project: TESTS_PROJECT,
    cwd: process.cwd(),
    className,
    srcPath: filename,
  });
  await compiler.compile();
  const teal = compiler.teal.approval.map((t) => t.teal.trim()).filter((t) => t.length > 0);

  const labelIndex = teal.indexOf(`${methodName}:`);
  const retsubIndex = teal.indexOf('retsub', labelIndex);
  return teal.slice(labelIndex + 3, retsubIndex);
}

export function lowerFirstChar(str: string) {
  return `${str.charAt(0).toLocaleLowerCase() + str.slice(1)}`;
}

export function artifactsTest(sourcePath: string, artifactsPath: string, className: string, lsig = false) {
  const project = sourcePath.startsWith('examples/') ? EXAMPLES_PROJECT : TESTS_PROJECT;
  const compiler = new Compiler({
    srcPath: sourcePath,
    disableWarnings: true,
    disableTypeScript: true,
    project,
    className,
    cwd: process.cwd(),
  });
  describe(`${className} Artifacts`, () => {
    beforeAll(async () => {
      await compiler.compile();
      await compiler.algodCompile();
    });

    test('Generates TEAL', () => {
      const target = lsig ? 'lsig' : 'approval';
      expect(compiler.teal[target].map((t) => t.teal).join('\n')).toEqual(
        fs.readFileSync(`${artifactsPath}/${className}.${target}.teal`, 'utf-8')
      );
    });

    if (!lsig) {
      test('Generates ABI JSON', () => {
        expect(compiler.abiJSON()).toEqual(
          JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc4.json`, 'utf-8'))
        );
      });

      test('Generates App Spec', () => {
        expect(compiler.appSpec()).toEqual(
          JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc32.json`, 'utf-8'))
        );
      });
    }
  });
}

export async function compileAndCreate(
  sender: algosdk.Account,
  sourcePath: string,
  artifactsPath: string,
  className: string
): Promise<{
  appClient: ApplicationClient;
  appId: number | bigint;
  compiler: Compiler;
}> {
  const compiler = new Compiler({
    cwd: process.cwd(),
    className,
    project: TESTS_PROJECT,
    srcPath: sourcePath,
    disableWarnings: true,
    disableTypeScript: true,
  });
  await compiler.compile();
  await compiler.algodCompile();

  expect(compiler.teal.approval.map((t) => t.teal).join('\n')).toEqual(
    fs.readFileSync(`${artifactsPath}/${className}.approval.teal`, 'utf-8')
  );
  expect(compiler.abiJSON()).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc4.json`, 'utf-8')));
  expect(compiler.appSpec()).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc32.json`, 'utf-8')));

  const appClient = algokit.getAppClient(
    {
      app: JSON.stringify(compiler.appSpec()),
      sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient
  );

  const { appId } = await appClient.create({
    method: 'createApplication',
    methodArgs: [],
    sendParams: { suppressLog: true },
  });

  return { appClient, appId, compiler };
}

export async function runMethod({
  appClient,
  method,
  methodArgs = [],
  callType = 'call',
  fundAmount = 0,
  fee = 1000,
}: {
  appClient: ApplicationClient;
  method: string;
  methodArgs?: algosdk.ABIArgument[];
  callType?: 'call' | 'optIn';
  fundAmount?: number;
  fee?: number;
}) {
  const params = {
    method,
    methodArgs,
    sendParams: { suppressLog: true, fee: algokit.microAlgos(fee), populateAppCallResources: true },
  };

  try {
    if (fundAmount > 0) {
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(fundAmount),
        sendParams: { suppressLog: true },
      });
    }
    return (await appClient[callType](params)).return?.returnValue;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    throw e;
  }
}

export function getErrorMessage(algodError: string, sourceInfo: { pc?: number[]; errorMessage?: string }[]) {
  const pc = Number(algodError.match(/(?<=pc=)\d+/)?.[0]);
  return sourceInfo.find((s) => s.pc?.includes(pc))?.errorMessage || `unknown error: ${algodError}`;
}
