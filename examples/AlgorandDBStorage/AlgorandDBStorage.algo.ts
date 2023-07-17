import { Contract } from "@algorandfoundation/tealscript";

// eslint-disable-next-line no-unused-vars
class AlgorandDBStorage extends Contract {
  data = new BoxMap<bytes, bytes>();
  /**
   * Add key to the algorand DB Storage.
   * If key exists, tx will fail.
   *
   * @param key DB key
   * @param value DB Value
   */
  add(key: string, value: bytes): void {
    assert(this.txn.sender === globals.creatorAddress);
    assert(!this.data.exists(key));
    this.data.set(key, value);
  }
  /**
   * Update the value at the key at the algorand DB Storage.
   * If key does not exists, tx will fail.
   *
   * @param key DB key
   * @param value DB Value
   */
  update(key: string, value: bytes): void {
    assert(this.txn.sender === globals.creatorAddress);
    assert(this.data.exists(key));
    this.data.delete(key);
    this.data.set(key, value);
  }
  /**
   * Update the value at the key at the algorand DB Storage.
   * If key does not exists, tx will not fail, but will add the item to the storage.
   *
   * @param key DB key
   * @param value DB Value
   */
  upsert(key: string, value: bytes): void {
    assert(this.txn.sender === globals.creatorAddress);
    this.data.set(key, value);
  }
  /**
   * Deletes the key at the algorand DB Storage.
   * If key does not exists, tx will fail.
   *
   * @param key DB key
   */
  delete(key: string): void {
    assert(this.txn.sender === globals.creatorAddress);
    assert(this.data.exists(key));
    this.data.delete(key);
  }

  // /**
  //  * https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0073.md
  //  * @param key
  //  * @returns True if interface is supported
  //  */
  // supportsInterface(key:bytes) : boolean {
  //   if(key == method("add(string,byte[])void")) return true;
  //   if(key == method("update(string,byte[])void")) return true;
  //   if(key == method("upsert(string,byte[])void")) return true;
  //   if(key == method("delete(string)void")) return true;
  //   return false;
  // }
}
