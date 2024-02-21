---
editUrl: false
next: false
prev: false
title: "Application"
---

A stateful Algorand application

## Constructors

### new Application()

> **new Application**(): [`Application`](Application.md)

#### Returns

[`Application`](Application.md)

## Properties

### address

> **`readonly`** **address**: [`Address`](Address.md)

The contract address for this application

#### Source

[types/global.d.ts:530](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L530)

***

### approvalProgram

> **`readonly`** **approvalProgram**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The approval program for the application

#### Source

[types/global.d.ts:506](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L506)

***

### clearStateProgram

> **`readonly`** **clearStateProgram**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The clear state program for the application

#### Source

[types/global.d.ts:509](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L509)

***

### creator

> **`readonly`** **creator**: [`Address`](Address.md)

The creator of this application

#### Source

[types/global.d.ts:527](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L527)

***

### extraProgramPages

> **`readonly`** **extraProgramPages**: [`uint64`](../type-aliases/uint64.md)

The number of extra program pages

#### Source

[types/global.d.ts:524](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L524)

***

### globalNumByteSlice

> **`readonly`** **globalNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

The number of reserved byteslices in global state

#### Source

[types/global.d.ts:515](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L515)

***

### globalNumUint

> **`readonly`** **globalNumUint**: [`uint64`](../type-aliases/uint64.md)

The number of reserved uint64s in global state

#### Source

[types/global.d.ts:512](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L512)

***

### id

> **`readonly`** **id**: [`uint64`](../type-aliases/uint64.md)

The application index

#### Source

[types/global.d.ts:500](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L500)

***

### localNumByteSlice

> **`readonly`** **localNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

The number of reserved byteslices in local state

#### Source

[types/global.d.ts:521](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L521)

***

### localNumUint

> **`readonly`** **localNumUint**: [`uint64`](../type-aliases/uint64.md)

The number of reserved uint64s in local state

#### Source

[types/global.d.ts:518](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L518)

***

### zeroIndex

> **`static`** **`readonly`** **zeroIndex**: [`Application`](Application.md)

Application index 0

#### Source

[types/global.d.ts:503](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L503)

## Methods

### globalState()

> **globalState**(`key`): `unknown`

Get the global state value for the given key. **MUST** use an as expression to specify the value type.

#### Parameters

• **key**: [`BytesLike`](../type-aliases/BytesLike.md)

#### Returns

`unknown`

#### Example

```ts
someApp.globalState('someKey') as uint64[];
```

#### Source

[types/global.d.ts:540](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L540)

***

### localState()

> **localState**(`account`, `key`): `unknown`

Get the local state value for the given account and key. **MUST** use an as expression to specify the value type.

#### Parameters

• **account**: [`Address`](Address.md)

• **key**: [`BytesLike`](../type-aliases/BytesLike.md)

#### Returns

`unknown`

#### Example

```ts
someApp.localState(this.txn.sender, 'someKey') as uint64[];
```

#### Source

[types/global.d.ts:550](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L550)

***

### fromID()

> **`static`** **fromID**(`appID`): [`Application`](Application.md)

Get an `Application` instance for the application with the given application index

#### Parameters

• **appID**: [`uint64`](../type-aliases/uint64.md)

#### Returns

[`Application`](Application.md)

#### Source

[types/global.d.ts:497](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L497)
