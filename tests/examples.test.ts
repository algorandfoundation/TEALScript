/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe } from '@jest/globals';
import { artifactsTest } from './common';

describe('Examples', function () {
  artifactsTest('examples/amm/amm.algo.ts', 'ConstantProductAMM');

  artifactsTest('examples/arc58/arc58.algo.ts', 'AbstractedAccount');

  artifactsTest('examples/arc72/arc72.algo.ts', 'ARC72');

  artifactsTest('examples/arc75/arc75.algo.ts', 'ARC75');

  artifactsTest('examples/auction/auction.algo.ts', 'Auction');

  artifactsTest('examples/big_box/big_box.algo.ts', 'BigBox');

  artifactsTest('examples/calculator/calculator.algo.ts', 'Calculator');

  ['FactoryCaller', 'NFTFactory'].forEach((className) => {
    artifactsTest('examples/itxns/itxns.algo.ts', className);
  });

  artifactsTest('examples/lsig_with_app/lsig_with_app.algo.ts', 'OptInLsig', { lsig: true });
  artifactsTest('examples/lsig_with_app/lsig_with_app.algo.ts', 'CreatorVerifier');

  artifactsTest('examples/merkle/merkle.algo.ts', 'MerkleTree');

  artifactsTest('examples/non_abi/non_abi.algo.ts', 'NonABIExample');

  artifactsTest('examples/reti/validatorRegistry.algo.ts', 'ValidatorRegistry');
  artifactsTest('examples/reti/stakingPool.algo.ts', 'StakingPool');

  artifactsTest('examples/simple/simple.algo.ts', 'Simple');

  artifactsTest('examples/tuple_in_box/app.algo.ts', 'ContactsApp');
});
