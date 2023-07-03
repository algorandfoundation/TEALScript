import { Contract } from '../../src/lib/index';

type DataInfo = {start: uint64, end: uint64, status: uint<8>, endSize: uint64};

const IN_PROGRESS = 0 as uint<8>;
const READY = 1 as uint<8>;
const IMMUTABLE = 2 as uint<8>;

const COST_PER_BYTE = 400;
const COST_PER_BOX = 2500;
const MAX_BOX_SIZE = 32768;

// eslint-disable-next-line no-unused-vars
class BigBox extends Contract {
  dataBoxes = new BoxMap<uint64, bytes>();

  info = new BoxMap<bytes, DataInfo>();

  currentIndex = new GlobalStateKey<uint64>();

  startUpload(name: string, numBoxes: uint64, endBoxSize: uint64, mbrPayment: PayTxn): void {
    const startBox = this.currentIndex.get();
    const endBox = startBox + numBoxes - 1;

    const dataInfo: DataInfo = {
      start: startBox, end: endBox, status: IN_PROGRESS, endSize: endBoxSize,
    };

    assert(!this.info.exists(name));

    this.info.set(name, dataInfo);

    this.currentIndex.set(endBox + 1);

    const totalCost = numBoxes * COST_PER_BOX // cost of boxes
    + (numBoxes - 1) * MAX_BOX_SIZE * COST_PER_BYTE // cost of data
    + numBoxes * 64 * COST_PER_BYTE // cost of keys
    + endBoxSize * COST_PER_BYTE; // cost of last box data

    assert(mbrPayment.amount === totalCost);
    assert(mbrPayment.receiver === this.app.address);
  }

  upload(name: string, boxIndex: uint64, offset: uint64, data: bytes): void {
    const dataInfo = this.info.get(name);
    assert(dataInfo.status === IN_PROGRESS);
    assert(dataInfo.start <= boxIndex && boxIndex <= dataInfo.end);

    if (offset === 0) {
      this.dataBoxes.create(boxIndex, boxIndex === dataInfo.end ? dataInfo.endSize : MAX_BOX_SIZE);
    }

    this.dataBoxes.replace(boxIndex, offset, data);
  }

  setStatus(name: string, status: uint<8>): void {
    const currentStatus = this.info.get(name).status;

    assert(status === READY || status === IMMUTABLE || status === IN_PROGRESS);
    assert(currentStatus !== IMMUTABLE);

    this.info.get(name).status = status;
  }
}
