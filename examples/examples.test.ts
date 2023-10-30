/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe } from '@jest/globals';
import { artifactsTest } from '../tests/common';

describe('Examples', function () {
  artifactsTest('examples/amm/amm.algo.ts', 'examples/amm/tealscript_artifacts/', 'ConstantProductAMM');

  artifactsTest('examples/arc75/arc75.algo.ts', 'examples/arc75/artifacts/', 'ARC75');

  artifactsTest('examples/auction/auction.algo.ts', 'examples/auction/tealscript_artifacts/', 'Auction');

  ['FactoryCaller', 'NFTFactory'].forEach((className) => {
    artifactsTest('examples/itxns/itxns.algo.ts', 'examples/itxns/artifacts/', className);
  });

  artifactsTest('examples/simple/simple.algo.ts', 'examples/simple/artifacts/', 'Simple');

  artifactsTest('examples/tuple_in_box/app.algo.ts', 'examples/tuple_in_box/tealscript_artifacts/', 'ContactsApp');

  artifactsTest('examples/calculator/calculator.algo.ts', 'examples/calculator/artifacts/', 'Calculator');

  artifactsTest('examples/merkle/merkle.algo.ts', 'examples/merkle/artifacts/', 'MerkleTree');
});
