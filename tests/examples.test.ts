/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import * as fs from 'fs';
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../src/lib/compiler';

['Master', 'Vault'].forEach((className) => {
  describe(`ARC12 ${className}`, function () {
    before(async function () {
      const content = fs.readFileSync('examples/arc12/arc12.ts', 'utf-8');
      this.compiler = new Compiler(content, className, 'examples/arc12/arc12.ts');
      await this.compiler.compile();
      await this.compiler.algodCompile();
    });

    it('Generates TEAL', function () {
      expect(this.compiler.approvalProgram()).to.equal(fs.readFileSync(`examples/arc12/${className}.approval.teal`, 'utf-8'));
    });

    it('Generates Sourcemap', function () {
      expect(this.compiler.pcToLine).to.deep.equal(JSON.parse(fs.readFileSync(`examples/arc12/${className}.src_map.json`, 'utf-8')));
    });

    it('Generates ABI JSON', function () {
      expect(this.compiler.abi).to.deep.equal(JSON.parse(fs.readFileSync(`examples/arc12/${className}.abi.json`, 'utf-8')));
    });

    it('Generates App Spec', function () {
      expect(this.compiler.appSpec()).to.deep.equal(JSON.parse(fs.readFileSync(`examples/arc12/${className}.json`, 'utf-8')));
    });
  });
});
