/* eslint-disable no-console */
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

export function artifactsTest(
  sourcePath: string,
  artifactsPath: string,
  className: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { lsig?: boolean } = {}
) {
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

    const target = options.lsig ? 'lsig' : 'approval';

    test('Generates TEAL', () => {
      expect(compiler.teal[target].map((t) => t.teal).join('\n')).toEqual(
        fs.readFileSync(`${artifactsPath}/${className}.${target}.teal`, 'utf-8')
      );
    });

    test('Maintains program size', async function () {
      expect(compiler.estimatedProgramSize[target]).toMatchSnapshot();
    });

    if (!options.lsig) {
      test('Generates ABI JSON', () => {
        expect(compiler.arc4Description()).toEqual(
          JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc4.json`, 'utf-8'))
        );
      });

      test('Generates ARC32', () => {
        expect(compiler.arc32Description()).toEqual(
          JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc32.json`, 'utf-8'))
        );
      });

      test('Generates ARC56', () => {
        expect(compiler.arc56Description()).toEqual(
          JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc56.json`, 'utf-8'))
        );
      });
    }
  });
}

export async function compileAndCreate(
  sender: algosdk.Account,
  sourcePath: string,
  artifactsPath: string,
  className: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deployTimeParams?: Record<string, any>
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
  expect(compiler.arc4Description()).toEqual(
    JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc4.json`, 'utf-8'))
  );
  expect(compiler.arc32Description()).toEqual(
    JSON.parse(fs.readFileSync(`${artifactsPath}/${className}.arc32.json`, 'utf-8'))
  );

  const appClient = algokit.getAppClient(
    {
      app: JSON.stringify(compiler.arc32Description()),
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
    deployTimeParams,
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
  skipEvalTrace = false,
  forceEvalTrace = false,
}: {
  appClient: ApplicationClient;
  method: string;
  methodArgs?: algosdk.ABIArgument[];
  callType?: 'call' | 'optIn';
  fundAmount?: number;
  fee?: number;
  skipEvalTrace?: boolean;
  forceEvalTrace?: boolean;
}) {
  const params = {
    method,
    methodArgs,
    sendParams: { suppressLog: true, fee: algokit.microAlgos(fee), populateAppCallResources: true },
  };

  let returnValue;
  let thrownError;

  try {
    if (fundAmount > 0) {
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(fundAmount),
        sendParams: { suppressLog: true },
      });
    }
    returnValue = (await appClient[callType](params)).return?.returnValue;
  } catch (e) {
    if (skipEvalTrace) {
      console.warn(e);
      throw e;
    }

    thrownError = e;
  }

  if (thrownError || forceEvalTrace) {
    // eslint-disable-next-line no-console
    const abiMethod = appClient.getABIMethod(params.method)!;
    const { appId } = await appClient.getAppReference();
    const atc = new algosdk.AtomicTransactionComposer();

    // @ts-expect-error sender is private but we need it
    const senderAccount: algosdk.Account = appClient.sender;
    atc.addMethodCall({
      appID: Number(appId),
      method: abiMethod,
      methodArgs: params.methodArgs,
      sender: senderAccount.addr,
      suggestedParams: await algodClient.getTransactionParams().do(),
      signer: algosdk.makeBasicAccountTransactionSigner(senderAccount),
    });

    const execTraceConfig = new algosdk.modelsv2.SimulateTraceConfig({
      enable: true,
      scratchChange: true,
      stackChange: true,
      stateChange: true,
    });
    const simReq = new algosdk.modelsv2.SimulateRequest({
      txnGroups: [],
      execTraceConfig,
    });

    const resp = await atc.simulate(algodClient, simReq);

    // @ts-expect-error appSpec is private but we need it
    const approvalProgramTeal = Buffer.from(appClient.appSpec.source.approval, 'base64').toString();

    const trace = resp.simulateResponse.txnGroups[0].txnResults[0].execTrace!.approvalProgramTrace!;
    // eslint-disable-next-line no-use-before-define
    const fullTrace = await getFullTrace(trace, approvalProgramTeal, algodClient);
    // eslint-disable-next-line no-use-before-define
    printFullTrace(fullTrace);
  }

  if (thrownError) {
    throw thrownError;
  }

  return returnValue;
}

export function getErrorMessage(algodError: string, sourceInfo: { pc?: number[]; errorMessage?: string }[]) {
  const pc = Number(algodError.match(/(?<=pc=)\d+/)?.[0]);
  return sourceInfo.find((s) => s.pc?.includes(pc))?.errorMessage || `unknown error: ${algodError}`;
}

type FullTrace = {
  teal: string;
  pc: number;
  scratchDelta?: { [slot: number]: string | number };
  stack: (string | number)[];
}[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getFullTrace(simTrace: any[], teal: string, algod: algosdk.Algodv2): Promise<FullTrace> {
  const result = await algod.compile(teal).sourcemap(true).do();

  const srcMap = new algosdk.SourceMap(result.sourcemap);

  let stack: (string | number)[] = [];

  const fullTrace: FullTrace = [];

  simTrace.forEach((t) => {
    let newStack: (string | number)[] = [...stack];

    if (t.stackPopCount) {
      newStack = newStack.slice(0, -t.stackPopCount);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t.stackAdditions?.forEach((s: any) => {
      if (s.bytes) {
        newStack.push(`0x${Buffer.from(s.bytes, 'base64').toString('hex')}`);
      } else newStack.push(s.uint || 0);
    });

    const scratchDelta = t.scratchChanges?.map((s) => {
      const delta = {};

      const value = s.newValue;

      if (s.bytes) {
        delta[s.slot] = `0x${Buffer.from(value.bytes, 'base64').toString('hex')}`;
      } else delta[s.slot] = value.uint || 0;

      return delta;
    });

    fullTrace.push({
      teal: teal.split('\n')[srcMap.pcToLine[t.pc as number]],
      pc: t.pc,
      stack: newStack,
      scratchDelta,
    });

    stack = newStack;
  });

  return fullTrace;
}

function adjustWidth(line: string, width: number) {
  if (line.length > width) {
    return `${line.slice(0, width - 3)}...`;
  }
  if (line.length < width) {
    return line.padEnd(width);
  }
  return line;
}

function printFullTrace(fullTrace: FullTrace, width: number = 30) {
  console.warn(`${'TEAL'.padEnd(width)} | PC   | STACK`);
  console.warn(`${'-'.repeat(width)}-|------|${'-'.repeat(7)}`);
  fullTrace.forEach((t) => {
    const teal = adjustWidth(t.teal.trim(), width);
    const pc = t.pc.toString().padEnd(4);
    console.warn(`${teal} | ${pc} | [${t.stack}]`);
  });
}
