import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class StorageTest extends Contract {
  globalKey = GlobalStateKey<bytes>({ key: 'foo' });

  globalMap = GlobalStateMap<bytes, bytes>({ maxKeys: 1 });

  localKey = LocalStateKey<bytes>({ key: 'foo' });

  localMap = LocalStateMap<bytes, bytes>({ maxKeys: 1 });

  boxKey = BoxKey<bytes>({ key: 'foo', dynamicSize: false });

  boxMap = BoxMap<bytes, bytes>({ dynamicSize: false });

  boxMapWithPrefix = BoxMap<bytes, bytes>({ prefix: 'f' });

  prefix(): void {
    this.boxMapWithPrefix['oo'] = 'bar';
  }

  globalKeyPut(): void {
    this.globalKey = 'bar';
  }

  globalKeyGet(): void {
    assert(this.globalKey === 'bar');
  }

  globalKeyDelete(): void {
    this.globalKey.delete();
  }

  globalKeyExists(): void {
    assert(this.globalKey.exists);
  }

  localKeyPut(a: Account): void {
    this.localKey[a] = 'bar';
  }

  localKeyGet(a: Account): void {
    assert(this.localKey[a] === 'bar');
  }

  localKeyDelete(a: Account): void {
    this.localKey[a].delete();
  }

  localKeyExists(a: Account): void {
    assert(this.localKey[a].exists);
  }

  boxKeyPut(): void {
    this.boxKey = 'bar';
  }

  boxKeyGet(): void {
    assert(this.boxKey === 'bar');
  }

  boxKeyDelete(): void {
    this.boxKey.delete();
  }

  boxKeyExists(): void {
    assert(this.boxKey.exists);
  }

  globalMapPut(): void {
    this.globalMap['foo'] = 'bar';
  }

  globalMapGet(): void {
    assert(this.globalMap['foo'] === 'bar');
  }

  globalMapDelete(): void {
    this.globalMap['foo'].delete();
  }

  globalMapExists(): void {
    assert(this.globalMap['foo'].exists);
  }

  localMapPut(a: Account): void {
    this.localMap[a]['foo'] = 'bar';
  }

  localMapGet(a: Account): void {
    assert(this.localMap[a]['foo'] === 'bar');
  }

  localMapDelete(a: Account): void {
    this.localMap[a]['foo'].delete();
  }

  localMapExists(a: Account): void {
    assert(this.localMap[a]['foo'].exists);
  }

  boxMapPut(): bytes {
    return this.boxMap['foo'];
  }

  boxMapGet(): void {
    assert(this.boxMap['foo'] === 'bar');
  }

  boxMapDelete(): void {
    this.boxMap['foo'].delete();
  }

  boxMapExists(): void {
    assert(this.boxMap['foo'].exists);
  }

  boxKeyCreate(): void {
    this.boxKey.create(1024);
  }

  boxMapCreate(): void {
    this.boxMap['bar'].create(1024);
  }

  boxKeyLength(): uint64 {
    return this.boxKey.size;
  }

  boxMapLength(): uint64 {
    return this.boxMap['bar'].size;
  }

  boxKeyReplace(): void {
    this.boxKey.replace(0, 'abc');
  }

  boxMapReplace(): void {
    this.boxMap['bar'].replace(0, 'abc');
  }

  boxKeyExtract(): string {
    return this.boxKey.extract(0, 3);
  }

  boxMapExtract(): string {
    return this.boxMap['bar'].extract(0, 3);
  }

  isOptedIn(): boolean {
    return this.txn.sender.isOptedInToApp(this.app);
  }
}
