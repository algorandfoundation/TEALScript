/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';

export class ExternalContract extends Contract {
  externalKey = GlobalStateKey<number>();

  externalMethod(): void {
    this.externalKey.value = 7331;
  }
}
