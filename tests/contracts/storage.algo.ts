import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class StorageTest extends Contract {
  globalKey = GlobalStateKey<bytes>({ key: 'foo' });

  globalMap = GlobalStateMap<bytes, bytes>({ maxKeys: 1, allowPotentialCollisions: true });

  localKey = LocalStateKey<bytes>({ key: 'foo' });

  localMap = LocalStateMap<bytes, bytes>({ maxKeys: 1, allowPotentialCollisions: true });

  boxKey = BoxKey<bytes>({ key: 'foo', dynamicSize: false });

  boxMap = BoxMap<bytes, bytes>({ dynamicSize: false, allowPotentialCollisions: true });

  boxMapWithPrefix = BoxMap<bytes, bytes>({ prefix: 'f', allowPotentialCollisions: true });

  globalMapWithPrefix = GlobalStateMap<bytes, bytes>({ prefix: 'f', maxKeys: 1, allowPotentialCollisions: true });

  localMapWithPrefix = LocalStateMap<bytes, bytes>({ prefix: 'f', maxKeys: 1, allowPotentialCollisions: true });

  prefix(): void {
    this.boxMapWithPrefix('oo').value = 'bar';
    this.globalMapWithPrefix('oo').value = 'bar';
    this.localMapWithPrefix(this.txn.sender, 'oo').value = 'bar';
  }

  globalKeyPut(): void {
    this.globalKey.value = 'bar';
  }

  globalKeyGet(): void {
    assert(this.globalKey.value === 'bar');
  }

  globalKeyDelete(): void {
    this.globalKey.delete();
  }

  globalKeyExists(): void {
    assert(this.globalKey.exists);
  }

  localKeyPut(a: Account): void {
    this.localKey(a).value = 'bar';
  }

  localKeyGet(a: Account): void {
    assert(this.localKey(a).value === 'bar');
  }

  localKeyDelete(a: Account): void {
    this.localKey(a).delete();
  }

  localKeyExists(a: Account): void {
    assert(this.localKey(a).exists);
  }

  boxKeyPut(): void {
    this.boxKey.value = 'bar';
  }

  boxKeyGet(): void {
    assert(this.boxKey.value === 'bar');
  }

  boxKeyDelete(): void {
    this.boxKey.delete();
  }

  boxKeyExists(): void {
    assert(this.boxKey.exists);
  }

  globalMapPut(): void {
    this.globalMap('foo').value = 'bar';
  }

  globalMapGet(): void {
    assert(this.globalMap('foo').value === 'bar');
  }

  globalMapDelete(): void {
    this.globalMap('foo').delete();
  }

  globalMapExists(): void {
    assert(this.globalMap('foo').exists);
  }

  localMapPut(a: Account): void {
    this.localMap(a, 'foo').value = 'bar';
  }

  localMapGet(a: Account): void {
    assert(this.localMap(a, 'foo').value === 'bar');
  }

  localMapDelete(a: Account): void {
    this.localMap(a, 'foo').delete();
  }

  localMapExists(a: Account): void {
    assert(this.localMap(a, 'foo').exists);
  }

  boxMapPut(): void {
    this.boxMap('foo').value = 'bar';
  }

  boxMapGet(): void {
    assert(this.boxMap('foo').value === 'bar');
  }

  boxMapDelete(): void {
    this.boxMap('foo').delete();
  }

  boxMapExists(): void {
    assert(this.boxMap('foo').exists);
  }

  boxKeyCreate(): void {
    this.boxKey.create(1024);
  }

  boxMapCreate(): void {
    this.boxMap('bar').create(1024);
  }

  boxKeyLength(): uint64 {
    return this.boxKey.size;
  }

  boxMapLength(): uint64 {
    return this.boxMap('bar').size;
  }

  boxKeyReplace(): void {
    this.boxKey.replace(0, 'abc');
  }

  boxMapReplace(): void {
    this.boxMap('bar').replace(0, 'abc');
  }

  boxKeyExtract(): string {
    return this.boxKey.extract(0, 3);
  }

  boxMapExtract(): string {
    return this.boxMap('bar').extract(0, 3);
  }

  isOptedIn(): boolean {
    return this.txn.sender.isOptedInToApp(this.app);
  }

  exGlobal(): void {
    log(this.app.globalState('foo') as bytes);
  }

  exLocal(): void {
    log(this.app.localState(this.txn.sender, 'foo') as bytes);
  }
}
