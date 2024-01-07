/* eslint-disable class-methods-use-this */
import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Uint8Exp extends Contract {
  uint8exp(a: uint256, b: uint256): uint256 {
    return a ** b;
  }
}
