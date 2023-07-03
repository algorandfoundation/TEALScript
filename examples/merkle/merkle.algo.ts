import { Contract } from '../../src/lib/index';

const TREE_DEPTH = 3;
const EMPTY_HASH = hex('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
const RIGHT_SIBLING_PREFIX = 170;

type Branch = StaticArray<byte, 33>
type Path = StaticArray<Branch, typeof TREE_DEPTH>

// eslint-disable-next-line no-unused-vars
class MerkleTree extends Contract {
  root = new GlobalStateKey<bytes>();

  size = new GlobalStateKey<uint64>();

  private calcInitRoot(): bytes {
    let result = EMPTY_HASH;

    for (let i = 0; i < TREE_DEPTH; i = i + 1) {
      result = sha256(result + result);
    }

    return result;
  }

  private hashConcat(left: bytes, right: bytes): bytes {
    return sha256(left + right);
  }

  private isRightSibling(elem: Branch): boolean {
    return getbyte(elem, 0) === RIGHT_SIBLING_PREFIX;
  }

  private calcRoot(leaf: bytes, path: Path): bytes {
    let result = leaf;

    for (let i = 0; i < TREE_DEPTH; i = i + 1) {
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
    this.root.set(this.calcInitRoot());
  }

  verify(data: bytes, path: Path): void {
    assert(this.root.get() === this.calcRoot(sha256(data), path));
  }

  appendLeaf(data: bytes, path: Path): void {
    assert(data !== '');
    assert(this.root.get() === this.calcRoot(EMPTY_HASH, path));

    this.root.set(this.calcRoot(sha256(data), path));

    this.size.set(this.size.get() + 1);
  }

  updateLeaf(oldData: bytes, newData: bytes, path: Path): void {
    assert(newData !== '');
    assert(this.root.get() === this.calcRoot(sha256(oldData), path));

    this.root.set(this.calcRoot(sha256(newData), path));
  }
}
