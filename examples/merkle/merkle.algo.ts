import { Contract } from '../../src/lib/index';

const TREE_DEPTH = 3;
const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const RIGHT_SIBLING_PREFIX = 170;

type Branch = bytes<33>;
type Path = StaticArray<Branch, typeof TREE_DEPTH>;

// eslint-disable-next-line no-unused-vars
class MerkleTree extends Contract {
  root = GlobalStateKey<bytes32>();

  size = GlobalStateKey<uint64>();

  private calcInitRoot(): bytes32 {
    let result = hex(EMPTY_HASH) as bytes32;

    for (let i = 0; i < TREE_DEPTH; i = i + 1) {
      result = sha256(result + result);
    }

    return result;
  }

  private hashConcat(left: bytes32, right: bytes32): bytes32 {
    return sha256(left + right);
  }

  private isRightSibling(elem: Branch): boolean {
    return getbyte(elem, 0) === RIGHT_SIBLING_PREFIX;
  }

  private calcRoot(leaf: bytes32, path: Path): bytes32 {
    let result = leaf;

    for (let i = 0; i < TREE_DEPTH; i = i + 1) {
      const elem = path[i];

      if (this.isRightSibling(elem)) {
        result = this.hashConcat(result, extract3(elem, 1, 32) as bytes32);
      } else {
        result = this.hashConcat(extract3(elem, 1, 32) as bytes32, result);
      }
    }

    return result;
  }

  deleteApplication(): void {
    verifyAppCallTxn(this.txn, { sender: this.app.creator });
  }

  createApplication(): void {
    this.root.value = this.calcInitRoot();
  }

  verify(data: bytes, path: Path): void {
    assert(this.root.value === this.calcRoot(sha256(data), path));
  }

  appendLeaf(data: bytes, path: Path): void {
    assert(data !== '');
    assert(this.root.value === this.calcRoot(hex(EMPTY_HASH) as bytes32, path));

    this.root.value = this.calcRoot(sha256(data), path);

    this.size.value = this.size.value + 1;
  }

  updateLeaf(oldData: bytes, newData: bytes, path: Path): void {
    assert(newData !== '');
    assert(this.root.value === this.calcRoot(sha256(oldData), path));

    this.root.value = this.calcRoot(sha256(newData), path);
  }
}
