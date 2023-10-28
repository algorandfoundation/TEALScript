/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe } from '@jest/globals';
import { artifactsTest } from './common';

describe('Inner Transactions', function () {
  artifactsTest('tests/contracts/itxns.algo.ts', 'tests/contracts/artifacts/', 'ItxnsTest');
});
