---
editUrl: false
next: false
prev: false
title: "allow"
---

The allow decorators are used to specify when specific [OnComplete](https://developer.algorand.org/docs/get-details/dapps/avm/teal/specification/#oncomplete) operations are allowed after logic evaluation.
The OnComplete can be allowed on applicaiton creation via `@allow.create` or on non-create calls via `@allow.call`
By defualt, all methods are allowed to be called with the `NoOp` OnComplete (`@allow.call('NoOp')`). Once a single `@allow` decorator is used, `@allow.call(NoOp)` must be explicitly set if it is desired.

## Example

```ts
\@allow.create('OptIn') // Allow the creator to use this method to create the application and opt in at the same time
\@allow.call('OptIn') // Also allow anyone to call this method to opt in
foo() {
```

## Constructors

### new allow()

> **new allow**(): [`allow`](allow.md)

#### Returns

[`allow`](allow.md)

## Methods

### bareCall()

> **`static`** **bareCall**(`onComplete`): [`decorator`](../type-aliases/decorator.md)

When no the contract is called without an ABI method selector, allow this method logic to be evaluated for the given OnComplete

#### Parameters

• **onComplete**: `"NoOp"` \| `"OptIn"` \| `"CloseOut"` \| `"ClearState"` \| `"UpdateApplication"` \| `"DeleteApplication"`

#### Returns

[`decorator`](../type-aliases/decorator.md)

#### Source

[types/global.d.ts:1220](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1220)

***

### bareCreate()

> **`static`** **bareCreate**(`onComplete`): [`decorator`](../type-aliases/decorator.md)

When the contract is created without an ABI method selector, allow this method logic to be evaluated for the given OnComplete

#### Parameters

• **onComplete**: `"NoOp"` \| `"OptIn"` \| `"CloseOut"` \| `"ClearState"` \| `"UpdateApplication"` \| `"DeleteApplication"`= `'NoOp'`

#### Returns

[`decorator`](../type-aliases/decorator.md)

#### Source

[types/global.d.ts:1225](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1225)

***

### call()

> **`static`** **call**(`onComplete`): [`decorator`](../type-aliases/decorator.md)

Specify an allowed OnComplete when the method is called

#### Parameters

• **onComplete**: `"NoOp"` \| `"OptIn"` \| `"CloseOut"` \| `"ClearState"` \| `"UpdateApplication"` \| `"DeleteApplication"`

#### Returns

[`decorator`](../type-aliases/decorator.md)

#### Source

[types/global.d.ts:1210](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1210)

***

### create()

> **`static`** **create**(`onComplete`): [`decorator`](../type-aliases/decorator.md)

Specify an allowed OnComplete when the method is used for contract creation

#### Parameters

• **onComplete**: `"NoOp"` \| `"OptIn"` \| `"CloseOut"` \| `"ClearState"` \| `"UpdateApplication"` \| `"DeleteApplication"`= `'NoOp'`

#### Returns

[`decorator`](../type-aliases/decorator.md)

#### Source

[types/global.d.ts:1215](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1215)
