import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class KeyCollisionWithMap extends Contract {
  globalMap = GlobalStateMap<bytes, bytes>({ maxKeys: 1 });

  globalKey = GlobalStateKey<bytes>();
}

// eslint-disable-next-line no-unused-vars
class MapCollisionWithKey extends Contract {
  globalKey = BoxKey<bytes>();

  globalMap = BoxMap<bytes, bytes>();
}

// eslint-disable-next-line no-unused-vars
class MapSizeCollision extends Contract {
  uint8s = BoxMap<[uint<8>, uint<8>], bytes>();

  uint16 = BoxMap<uint<16>, bytes>();
}
