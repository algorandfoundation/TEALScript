---
title: Lifecycle Methods
---

## Create, Update, and Delete

By default, Algorand applications can be created, updated, and deleted. In TEALScript, applications can be created by default, but cannot be updated to deleted. The default `createApplication` method won't run any logic, but rather simply create the application on the chain. 

### Modifying create logic

To modify the logic executed upon applicaiton creation (for example, to set default storage values) your contract class must implement a method to override `createApplication`.

#### Example

```typescript
class Counter extends Contract {
  counter = GlobalStateKey<uint64>();

  createApplication(startingNumber: uint64): void {
    this.counter.value = startingNumber
  }
}
```

### Implementing a updateApplication Method

By default, TEALScript contracts cannot be updated. To allow a contract to be updated, a method that overrides `Contract.updateApplication` must be implemented.

#### Example

```typescript
class Counter extends Contract {
  counter = GlobalStateKey<uint64>();

  createApplication(startingNumber: uint64): void {
    this.counter.value = startingNumber
  }

  updateApplication(): void {
    assert(this.txn.sender === this.app.creator)
  }
}
```

### Implementing a deleteApplication Method

By defualt, TEALScript contracts cannot be deleted. To allow a contract to be deleted, a method that overrides `deleteApplication` must be implemented.

#### Example

```typescript
class Counter extends Contract {
  counter = GlobalStateKey<uint64>();

  createApplication(startingNumber: uint64): void {
    this.counter.value = startingNumber
  }

  deleteApplication(): void {
    assert(this.txn.sender === this.app.creator)
  }
}
```

## OptIn, CloseOut, and ClearState

If your contract uses local state, you will need to override the `optInToApplication` method and override `closeOutOfApplication` and/or `clearState` as desired. To learn more about contract state, see [this page](./storage.md)

## Advanced OnComplete Control

To have more granular control on what OnComplete a specific method allows, use the `allow.call` or `allow.create` decorator to control allowed OnCompletes when calling or creating the application. 

### Example

```typescript
class Counter extends Contract {
  counter = LocalStateKey<uint64>();

  // This method will increment a counter in local state
  @allow.create('OptIn') // Allow an OptIn create so the creators counter can be set when creating the app
  @allow.call('OptIn')   // Allow anyone to OptIn to the contract so they can use local state
  @allow.call('NoOp')    // Allow anyone to call the app again with a NoOp call (can only OptIn once)
  useLocalState(): void {
    if (!this.counter(this.txn.sender).exists) this.counter(this.txn.sender).value = 1
    else this.counter(this.txn.sender).value = this.counter(this.txn.sender).value + 1
  }
}
```