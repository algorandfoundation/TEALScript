## Handle Decorators
TEALScript provides some decorators to allow for the handling of specific actions (creation and various on-completes) via {@link handle}. If the method has no arguments, the method will be a bare method for the given action(s). Otherwise, the decorated method will be the ONLY method that can handle the given action.

## Create

By default, TEALScript contracts can be created a bare method call with the `NoOp` on complete. To add logic to the application's creation, you can use the {@link handle.createApplication handle.createApplication} decorator. If no arguments are provided to the method, the method will be the bare create logic.

### Examples
#### Bare Create
```ts
@handle.createApplication
bareCreateExample(): void {
  log("This app has been created!")
}
```

#### Non-Bare Create
```ts
@handle.createApplication
nonBareCreateExample(name: string): void {
  log("This app has been created by " + name + "!")
}
```

## Update

By default, TEALScript applications are immutable and cannot be udpated. To support updates, a method with the {@link handle.updateApplication handle.updateApplication} decorator must be defined. If the method has no arguments, it will be the bare update logic.

### Examples
#### Bare Update
```ts
@handle.updateApplication
bareUpdateExample(): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been updated!")
}
```

#### Non-Bare Update
```ts
@handle.updateApplication
nonBareUpdateExample(name: string): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been created by " + name + "!")
}
```

## Delete

By default, TEALScript applications are immutable and cannot be deleted. To support deletion, a method with the {@link handle.deleteApplication handle.deleteApplication} decorator must be defined. If the method has no arguments, it will be the bare delete logic.

### Examples

#### Bare Delete
```ts
@handle.deleteApplication
bareDeleteExample(): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been deleted!")
}
```

#### Non-Bare Delete
```ts
@handle.deleteApplication
nonBareDeleteExample(name: string): void {
  assert(this.txn.sender === this.app.creator)
  log("This app has been deleted by " + name + "!")
}
```

## Opt-In

By default, TEALScript applications do not allow opt ins. To support opting in for {@link types/storage.md local storage}, a method with the {@link handle.optIn handle.optIn} decorator must be defined. If the method has no arguments, it will be the bare opt-in logic.

### Examples

#### Bare Opt-In
```ts
@handle.optIn
bareDeleteExample(): void {
  log("User has opted in!")
}
```

#### Non-Bare Delete
```ts
@handle.optIn
nonBareDeleteExample(name: string): void {
  log(name + ' has opted in!')
}
```