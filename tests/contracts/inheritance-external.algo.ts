/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';

export type CustomType = uint<8>;
export const MY_CONST = 654;

export class ExternalContract extends Contract {
  externalKey = GlobalStateKey<CustomType>();

  externalMethod(): CustomType {
    this.externalKey.value = <CustomType>123;
    return this.externalKey.value;
  }
}
