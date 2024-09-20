/* eslint-disable no-return-assign */
import { Contract } from '../../src/lib/index';
import { IfTest } from './if.algo';

// eslint-disable-next-line no-unused-vars
class Templates extends Contract {
  bytesTmplVar = TemplateVar<bytes>();

  uint64TmplVar = TemplateVar<uint64>();

  bytes32TmplVar = TemplateVar<bytes32>();

  bytes64TmplVar = TemplateVar<bytes64>();

  tmpl(): void {
    log(this.bytesTmplVar);
    assert(this.uint64TmplVar);
  }

  specificLengthTemplateVar(): void {
    ed25519VerifyBare(this.bytesTmplVar, this.bytes64TmplVar, this.bytes32TmplVar);
  }
}
