## Allow Decorators
TEALScript provides some decorators to allow for the handling of specific actions (such as create, update, and delete) via {@link allow}.


## Create

By default, TEALScript contracts can be created with a bare method call (no arguments) with the `NoOp` on complete. To add logic to the application's creation, you can use the {@link handle.createApplication handle.createApplication} decorator. If no arguments are provided to the method, the method will be the bare create logic.

### Examples
#### Bare Create
```ts
@allow.bareCreate()
bareCreateExample(): void {
  log("This app has been created!")
}
```

#### Non-Bare Create
```ts
@allow.create()
nonBareCreateExample(name: string): void {
  log("This app has been created by " + name + "!")
}
```

## Update

By default, TEALScript applications are immutable and cannot be udpated. To support updates, a method with the {@link allow.call allow.call('UpdateApplication')} decorator must be defined. A bare update can also be implemented with {@link allow.bareCall allow.bareCall('UpdateApplication')}

### Examples
#### Bare Update
```ts
@allow.bareCall('UpdateApplication')
bareUpdateExample(): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been updated!")
}
```

#### Non-Bare Update
```ts
@allow.call('UpdateApplication')
nonBareUpdateExample(name: string): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been updated by " + name + "!")
}
```

## Delete

By default, TEALScript applications are immutable and cannot be deleted. To support updates, a method with the {@link allow.call allow.call('DeleteApplication')} decorator must be defined. A bare delete can also be implemented with {@link allow.bareCall allow.bareCall('DeleteApplication')}

### Examples

#### Bare Delete
```ts
@allow.bareCall('DeleteApplication')
bareDeleteExample(): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been deleted!")
}
```

#### Non-Bare Delete
```ts
@allow.call('DeleteApplication')
nonBareDeleteExample(name: string): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been deleted by " + name + "!")
}
```

## Opt-In

By default, TEALScript applications do not allow opt ins. To support opting in for {@link types/storage.md local storage}, a method with the {@link allow.call allow.call('OptIn')} or {@link allow.bareCall allow.bareCall('OptIn')} decorator must be defined.

### Examples

#### Bare Opt-In
```ts
@allow.bareCall('OptIn')
bareDeleteExample(): void {
  log("User has opted in!")
}
```

#### Non-Bare Delete
```ts
@allow.call('OptIn')
nonBareDeleteExample(name: string): void {
  log(name + ' has opted in!')
}
```