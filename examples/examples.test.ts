/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe } from '@jest/globals';
import { artifactsTest } from '../tests/common';

describe('Examples', function () {
  artifactsTest('examples/amm/amm.algo.ts', 'ConstantProductAMM');

  artifactsTest('examples/arc75/arc75.algo.ts', 'ARC75');

  artifactsTest('examples/auction/auction.algo.ts', 'Auction');

  ['FactoryCaller', 'NFTFactory'].forEach((className) => {
    artifactsTest('examples/itxns/itxns.algo.ts', className);
  });

  artifactsTest('examples/simple/simple.algo.ts', 'Simple');

  artifactsTest('examples/tuple_in_box/app.algo.ts', 'ContactsApp');

  artifactsTest('examples/calculator/calculator.algo.ts', 'Calculator');

  artifactsTest('examples/merkle/merkle.algo.ts', 'MerkleTree');
});
