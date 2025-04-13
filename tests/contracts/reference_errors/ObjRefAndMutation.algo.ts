import { Contract } from '../../../src/lib/index';

export class ObjRefAndMutation extends Contract {
  test(): void {
    const i = 0;
    const mockThis: { stakers: { value: { balance: uint64 }[] } } = { stakers: { value: [{ balance: 1 }] } };

    const cmpStaker = clone(mockThis.stakers.value[i]);
    // We're just adding more stake to their existing stake within a pool
    cmpStaker.balance += 1;

    // Update the box w/ the new data
    mockThis.stakers.value[i] = cmpStaker;

    mockThis.stakers.value[2] = { balance: 2 };

    assert(cmpStaker.balance === 2);
  }
}
