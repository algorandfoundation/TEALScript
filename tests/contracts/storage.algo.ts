import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class StorageTest extends Contract {
  globalKey = GlobalStateKey<bytes>({ key: 'foo' });

  globalMap = GlobalStateMap<bytes, bytes>({ maxKeys: 1 });

  localKey = new LocalStateKey<bytes>({ key: 'foo' });

  localMap = new LocalStateMap<bytes, bytes>({ maxKeys: 1 });

  boxKey = new BoxKey<bytes>({ key: 'foo', dynamicSize: false });

  boxMap = new BoxMap<bytes, bytes>({ dynamicSize: false });

  boxMapWithPrefix = new BoxMap<bytes, bytes>({ prefix: 'f' });

  prefix(): void {
    this.boxMapWithPrefix.set('oo', 'bar');
  }

  globalKeyPut(): void {
    this.globalKey.value = 'bar';
  }

  globalKeyGet(): void {
    assert(this.globalKey.value === 'bar');
  }

  globalKeyDelete(): void {
    this.globalKey.delete!();
  }

  globalKeyExists(): void {
    assert(this.globalKey.exists!);
  }

  localKeyPut(a: Account): void {
    this.localKey.set(a, 'bar');
  }

  localKeyGet(a: Account): void {
    assert(this.localKey.get(a) === 'bar');
  }

  localKeyDelete(a: Account): void {
    this.localKey.delete(a);
  }

  localKeyExists(a: Account): void {
    this.localKey.exists(a);
  }

  boxKeyPut(): void {
    this.boxKey.set('bar');
  }

  boxKeyGet(): void {
    assert(this.boxKey.get() === 'bar');
  }

  boxKeyDelete(): void {
    this.boxKey.delete();
  }

  boxKeyExists(): void {
    this.boxKey.exists();
  }

  globalMapPut(): void {
    this.globalMap.foo.value = 'bar';
  }

  globalMapGet(): void {
    assert(this.globalMap.foo.value === 'bar');
  }

  globalMapDelete(): void {
    this.globalMap.foo.delete!();
  }

  globalMapExists(): void {
    this.globalMap.foo.exists!;
  }

  localMapPut(a: Account): void {
    this.localMap.set(a, 'foo', 'bar');
  }

  localMapGet(a: Account): void {
    assert(this.localMap.get(a, 'foo') === 'bar');
  }

  localMapDelete(a: Account): void {
    this.localMap.delete(a, 'foo');
  }

  localMapExists(a: Account): void {
    this.localMap.exists(a, 'foo');
  }

  boxMapPut(): void {
    this.boxMap.set('foo', 'bar');
  }

  boxMapGet(): void {
    assert(this.boxMap.get('foo') === 'bar');
  }

  boxMapDelete(): void {
    this.boxMap.delete('foo');
  }

  boxMapExists(): void {
    this.boxMap.exists('foo');
  }

  boxKeyCreate(): void {
    this.boxKey.create(1024);
  }

  boxMapCreate(): void {
    this.boxMap.create('bar', 1024);
  }

  boxKeyLength(): uint64 {
    return this.boxKey.size();
  }

  boxMapLength(): uint64 {
    return this.boxMap.size('bar');
  }

  boxKeyReplace(): void {
    this.boxKey.replace(0, 'abc');
  }

  boxMapReplace(): void {
    this.boxMap.replace('bar', 0, 'abc');
  }

  boxKeyExtract(): string {
    return this.boxKey.extract(0, 3);
  }

  boxMapExtract(): string {
    return this.boxMap.extract('bar', 0, 3);
  }

  isOptedIn(): boolean {
    return this.txn.sender.isOptedInToApp(this.app);
  }
}
