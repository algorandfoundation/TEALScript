import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class MerkleTree extends Contract {
  root = new GlobalReference<bytes>();

  size = new GlobalReference<uint64>();

  private calcInitRoot(): bytes {
    let result = sha256('');

    for (let i = 0; i < 3; i = i + 1) {
      result = sha256(concat(result, result));
    }

    return result;
  }

  private hashConcat(left: bytes, right: bytes): bytes {
    return sha256(concat(left, right));
  }

  private isRightSibling(sibling: bytes): boolean {
    return getbyte(sibling, 0) === 170;
  }

  private calcRoot(leaf: bytes, path: StaticArray<byte<33>, 3>): bytes {
    let result = leaf;

    for (let i = 0; i < 3; i = i + 1) {
      const elem = path[i];

      if (this.isRightSibling(elem)) {
        result = this.hashConcat(result, extract3(elem, 1, 32));
      } else {
        result = this.hashConcat(extract3(elem, 1, 32), result);
      }
    }

    return result;
  }

  @handle.deleteApplication
  delete(): void {
    assert(this.txn.sender === this.app.creator);
  }

  @handle.createApplication
  create(): void {
    this.root.put(this.calcInitRoot());
  }

  verify(data: bytes, path: StaticArray<byte<33>, 3>): void {
    assert(this.root.get() === this.calcRoot(sha256(data), path));
  }

  appendLeaf(data: bytes, path: StaticArray<byte<33>, 3>): void {
    assert(data !== '');
    assert(this.root.get() === this.calcRoot(sha256(''), path));

    this.root.put(this.calcRoot(sha256(data), path));

    this.size.put(this.size.get() + 1);
  }

  updateLeaft(oldData: bytes, newData: bytes, path: StaticArray<byte<33>, 3>): void {
    assert(newData !== '');
    assert(this.root.get() === this.calcRoot(sha256(oldData), path));

    this.root.put(this.calcRoot(sha256(newData), path));
  }
}
