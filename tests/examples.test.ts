/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { artifactsTest } from './common';

artifactsTest('AMM', 'examples/amm/amm.algo.ts', 'examples/amm/tealscript_artifacts/', 'ConstantProductAMM');

['Master', 'Vault'].forEach((className) => {
  artifactsTest('ARC12', 'examples/arc12/arc12.algo.ts', 'examples/arc12/', className);
});

artifactsTest('ARC75', 'examples/arc75/arc75.algo.ts', 'examples/arc75/artifacts/', 'ARC75');

artifactsTest('Auction', 'examples/auction/auction.algo.ts', 'examples/auction/tealscript_artifacts/', 'Auction');

['FactoryCaller', 'NFTFactory'].forEach((className) => {
  artifactsTest('Inner Transactions', 'examples/itxns/itxns.algo.ts', 'examples/itxns/artifacts/', className);
});

artifactsTest('Simple', 'examples/simple/simple.algo.ts', 'examples/simple/artifacts/', 'Simple');

artifactsTest('Tuple In Box', 'examples/tuple_in_box/app.algo.ts', 'examples/tuple_in_box/tealscript_artifacts/', 'ContactsApp');

artifactsTest('Calculator', 'examples/calculator/calculator.algo.ts', 'examples/calculator/artifacts/', 'Calculator');

artifactsTest('MerkleTree', 'examples/merkle/merkle.algo.ts', 'examples/merkle/artifacts/', 'MerkleTree');
