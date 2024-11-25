/* eslint-disable no-plusplus */
/* eslint-disable no-empty */
/* eslint-disable no-bitwise */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test, expect } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';
import arc56 from './contracts/artifacts/Templates.arc56.json';

const NAME = 'Templates';
const PATH = 'tests/contracts/general.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

const BYTE_CBLOCK = 38;
const INT_CBLOCK = 32;

function getConstantBlockOffsets(bytes: number[]) {
  const programSize = bytes.length;
  bytes.shift(); // remove version
  const offsets: { bytecblockOffset?: number; intcblockOffset?: number; cblocksOffset: number } = { cblocksOffset: 0 };

  while (bytes.length > 0) {
    const byte = bytes.shift()!;

    if (byte === BYTE_CBLOCK || byte === INT_CBLOCK) {
      const isBytecblock = byte === BYTE_CBLOCK;
      const valuesRemaining = bytes.shift()!;

      for (let i = 0; i < valuesRemaining; i++) {
        if (isBytecblock) {
          // byte is the length of the next element
          bytes.splice(0, bytes.shift()!);
        } else {
          // intcblock is a uvarint, so we need to keep reading until we find the end (MSB is not set)
          while ((bytes.shift()! & 0x80) !== 0) {}
        }
      }

      offsets[isBytecblock ? 'bytecblock' : 'intcblock'] = programSize - bytes.length - 1;

      if (bytes[0] !== BYTE_CBLOCK && bytes[0] !== INT_CBLOCK) {
        // if the next opcode isn't a constant block, we're done
        break;
      }
    }
  }

  offsets.cblocksOffset = Math.max(...Object.values(offsets));
  return offsets;
}

describe('Template Variables', function () {
  artifactsTest(PATH, ARTIFACTS_DIR, NAME, {
    templateVars: {
      bytes64TmplVar: `0x${'0'.repeat(64)}`,
      uint64TmplVar: 123,
      bytes32TmplVar: `0x${'0'.repeat(32)}`,
      bytesTmplVar: '0xFF',
    },
  });

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('error source mapping', async function () {
      const { appClient, appId } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME, {
        bytes64TmplVar: '0'.repeat(64),
        uint64TmplVar: 123,
        bytes32TmplVar: '0'.repeat(32),
        bytesTmplVar: 'foo',
      });
      let pc = 0;
      try {
        await runMethod({ appClient, method: 'throwError' });
      } catch (error) {
        pc = Number(String(error).match(/pc=(\d+)/)?.[1]);
      }

      const appInfo = await algodClient.getApplicationByID(Number(appId)).do();
      const b64Program = appInfo.params['approval-program'];
      const program = Buffer.from(b64Program, 'base64');
      const { cblocksOffset } = getConstantBlockOffsets([...program]);

      const offsetPc = pc - cblocksOffset;

      const sourceInfo = arc56.sourceInfo.approval.sourceInfo.find((s) => s.pc?.includes(offsetPc));
      expect(sourceInfo?.errorMessage).toBe('this is an error');
    });
  });
});
