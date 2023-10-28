/* eslint-disable class-methods-use-this */
import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Uint8Exp extends Contract {
  uint8exp(a: uint<8>, b: uint<8>): uint<8> {
    return a ** b;
  }
}
