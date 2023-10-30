/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe } from '@jest/globals';
import { artifactsTest } from './common';

const PATH = 'tests/contracts/lsig.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('General', function () {
  artifactsTest(PATH, ARTIFACTS_DIR, 'BasicLsig', true);
  artifactsTest(PATH, ARTIFACTS_DIR, 'LsigWithArgs', true);
  artifactsTest(PATH, ARTIFACTS_DIR, 'LsigWithPrivateMethod', true);
});
