import { Contract } from '../../src/lib/index';

/*
start - The index of the box at which the data starts
end - The index of the box at which the data ends
status - 0: in progress, 1: ready, 2: immutable
endSize - The size of the last box
*/
type Metadata = { start: uint64; end: uint64; status: uint<8>; endSize: uint64 };

const IN_PROGRESS = 0 as uint<8>;
const READY = 1 as uint<8>;
const IMMUTABLE = 2 as uint<8>;

const COST_PER_BYTE = 400;
const COST_PER_BOX = 2500;
const MAX_BOX_SIZE = 32768;

// eslint-disable-next-line no-unused-vars
class BigBox extends Contract {
  // The boxes that contain the data, indexed by uint64
  dataBoxes = BoxMap<uint64, bytes>();

  // Metadata for a given data identifier
  // The data identifier can be any string up to 64 bytes
  metadata = BoxMap<bytes, Metadata>();

  // The index of the next box to be created
  currentIndex = GlobalStateKey<uint64>();

  /**
   *
   * Allocate boxes to begin data upload process
   *
   * @param dataIdentifier The unique identifier for the data
   * @param numBoxes The number of boxes that the data will take up
   * @param endBoxSize The size of the last box
   * @param mbrPayment Payment from the uploader to cover the box MBR
   */
  startUpload(dataIdentifier: string, numBoxes: uint64, endBoxSize: uint64, mbrPayment: PayTxn): void {
    const startBox = this.currentIndex.value;
    const endBox = startBox + numBoxes - 1;

    const metadata: Metadata = {
      start: startBox,
      end: endBox,
      status: IN_PROGRESS,
      endSize: endBoxSize,
    };

    assert(!this.metadata(dataIdentifier).exists);

    this.metadata(dataIdentifier).value = metadata;

    this.currentIndex.value = endBox + 1;

    const totalCost =
      numBoxes * COST_PER_BOX + // cost of boxes
      (numBoxes - 1) * MAX_BOX_SIZE * COST_PER_BYTE + // cost of data
      numBoxes * 64 * COST_PER_BYTE + // cost of keys
      endBoxSize * COST_PER_BYTE; // cost of last box data

    verifyTxn(mbrPayment, { receiver: this.app.address, amount: totalCost });
  }

  /**
   *
   * Upload data to a specific offset in a box
   *
   * @param dataIdentifier The unique identifier for the data
   * @param boxIndex The index of the box to upload the given chunk of data to
   * @param offset The offset within the box to start writing the data
   * @param data The data to write
   */
  upload(dataIdentifier: string, boxIndex: uint64, offset: uint64, data: bytes): void {
    const metadata = this.metadata(dataIdentifier).value;
    assert(metadata.status === IN_PROGRESS);
    assert(metadata.start <= boxIndex && boxIndex <= metadata.end);

    if (offset === 0) {
      this.dataBoxes(boxIndex).create(boxIndex === metadata.end ? metadata.endSize : MAX_BOX_SIZE);
    }

    this.dataBoxes(boxIndex).replace(offset, data);
  }

  /**
   *
   * Set the status of the data
   *
   * @param dataIdentifier The unique identifier for the data
   * @param status The new status for the data
   */
  setStatus(dataIdentifier: string, status: uint<8>): void {
    const currentStatus = this.metadata(dataIdentifier).value.status;

    assert(status === READY || status === IMMUTABLE || status === IN_PROGRESS);
    assert(currentStatus !== IMMUTABLE);

    this.metadata(dataIdentifier).value.status = status;
  }
}
