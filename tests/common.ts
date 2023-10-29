/* eslint-disable func-names */

import fs from 'fs';
import algosdk from 'algosdk';
import { expect, describe, test, beforeAll } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import Compiler from '../src/lib/compiler';

export const indexerClient = new algosdk.Indexer('a'.repeat(64), 'http://localhost', 8980);
export const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
export const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

export async function getMethodTeal(filename: string, className: string, methodName: string): Promise<string[]> {
  const compiler = new Compiler(fs.readFileSync(filename, 'utf-8'), className, { disableWarnings: true });
  await compiler.compile();
  const teal = compiler.teal.approval.map((t) => t.teal.trim()).filter((t) => t.length > 0);

  const labelIndex = teal.indexOf(`${methodName}:`);
  const retsubIndex = teal.indexOf('retsub', labelIndex);
  return teal.slice(labelIndex + 2, retsubIndex);
}

export function lowerFirstChar(str: string) {
  return `${str.charAt(0).toLocaleLowerCase() + str.slice(1)}`;
}

export function artifactsTest(sourcePath: string, artifactsPath: string, className: string) {
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const compiler = new Compiler(content, className, {
    filename: sourcePath,
    disableWarnings: true,
    disableTypeScript: true,
  });
  describe(`${className} Artifacts`, () => {
    beforeAll(async () => {
      await compiler.compile();
      await compiler.algodCompile();
    });

    test('Generates TEAL', () => {
      expect(compiler.teal.approval.map((t) => t.teal).join('\n')).toEqual(
        fs.readFileSync(`${artifactsPath}/${className}.approval.teal`, 'utf-8')
      );
    });

    test('Generates ABI JSON', () => {
      expect(compiler.abi).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.abi.json`, 'utf-8')));
    });

    test('Generates App Spec', () => {
      expect(compiler.appSpec()).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.json`, 'utf-8')));
    });
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
}> {
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const compiler = new Compiler(content, className, {
    filename: sourcePath,
    disableWarnings: true,
    disableTypeScript: true,
  });
  await compiler.compile();
  await compiler.algodCompile();

  expect(compiler.teal.approval.map((t) => t.teal).join('\n')).toEqual(
    fs.readFileSync(`${artifactsPath}/${className}.approval.teal`, 'utf-8')
  );
  expect(compiler.abi).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.abi.json`, 'utf-8')));
  expect(compiler.appSpec()).toEqual(JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.json`, 'utf-8')));

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

  return { appClient, appId };
}

export async function runMethod({
  appClient,
  method,
  methodArgs = [],
  callType = 'call',
  boxes = [],
  fundAmount = 0,
}: {
  appClient: ApplicationClient;
  method: string;
  methodArgs?: algosdk.ABIArgument[];
  callType?: 'call' | 'optIn';
  boxes?: {
    appIndex: number;
    name: Uint8Array;
  }[];
  fundAmount?: number;
}) {
  const params = {
    method,
    methodArgs,
    boxes,
    sendParams: { suppressLog: true },
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
