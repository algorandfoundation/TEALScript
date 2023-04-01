/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { artifactsTest } from './common';

artifactsTest('AMM', 'examples/amm/amm.ts', 'examples/amm/tealscript_artifacts/', 'ConstantProductAMM');

['Master', 'Vault'].forEach((className) => {
  artifactsTest('ARC12', 'examples/arc12/arc12.ts', 'examples/arc12/', className);
});

artifactsTest('ARC75', 'examples/arc75/arc75.ts', 'examples/arc75/artifacts/', 'ARC75');

artifactsTest('Auction', 'examples/auction/auction.ts', 'examples/auction/tealscript_artifacts/', 'Auction');

['FactoryCaller', 'NFTFactory'].forEach((className) => {
  artifactsTest('Inner Transactions', 'examples/itxns/itxns.ts', 'examples/itxns/artifacts/', className);
});

artifactsTest('Simple', 'examples/simple/simple.ts', 'examples/simple/artifacts/', 'Simple');

artifactsTest('Tuple In Box', 'examples/tuple_in_box/app.ts', 'examples/tuple_in_box/tealscript_artifacts/', 'ContactsApp');
