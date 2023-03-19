/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import * as fs from 'fs';
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../src/lib/compiler';

function exampleTest(
  testName: string,
  sourcePath: string,
  artifactsPath: string,
  className: string,
) {
  describe(`${testName} ${className}`, function () {
    before(async function () {
      const content = fs.readFileSync(sourcePath, 'utf-8');
      this.compiler = new Compiler(content, className, sourcePath);
      await this.compiler.compile();
      await this.compiler.algodCompile();
    });

    it('Generates TEAL', function () {
      expect(this.compiler.approvalProgram()).to.equal(fs.readFileSync(`${artifactsPath}.approval.teal`, 'utf-8'));
    });

    it('Generates Sourcemap', function () {
      expect(this.compiler.pcToLine).to.deep.equal(JSON.parse(fs.readFileSync(`${artifactsPath}.src_map.json`, 'utf-8')));
    });

    it('Generates ABI JSON', function () {
      expect(this.compiler.abi).to.deep.equal(JSON.parse(fs.readFileSync(`${artifactsPath}.abi.json`, 'utf-8')));
    });

    it('Generates App Spec', function () {
      expect(this.compiler.appSpec()).to.deep.equal(JSON.parse(fs.readFileSync(`${artifactsPath}.json`, 'utf-8')));
    });
  });
}

exampleTest('AMM', 'examples/amm/amm.ts', 'examples/amm/tealscript_artifacts/ConstantProductAMM', 'ConstantProductAMM');

['Master', 'Vault'].forEach((className) => {
  exampleTest('ARC12', 'examples/arc12/arc12.ts', `examples/arc12/${className}`, className);
});

exampleTest('ARC75', 'examples/arc75/arc75.ts', 'examples/arc75/artifacts/ARC75', 'ARC75');

exampleTest('Auction', 'examples/auction/auction.ts', 'examples/auction/tealscript_artifacts/Auction', 'Auction');

['FactoryCaller', 'NFTFactory'].forEach((className) => {
  exampleTest('Inner Transactions', 'examples/itxns/itxns.ts', `examples/itxns/artifacts/${className}`, className);
});

exampleTest('Simple', 'examples/simple/simple.ts', 'examples/simple/artifacts/Simple', 'Simple');

exampleTest('Tuple In Box', 'examples/tuple_in_box/app.ts', 'examples/tuple_in_box/tealscript_artifacts/ContactsApp', 'ContactsApp');
