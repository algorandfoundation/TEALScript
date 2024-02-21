---
editUrl: false
next: false
prev: false
title: "sendAppCall"
---

> **sendAppCall**(`params`): `void`

Send an app call transaction

## Parameters

• **params**

• **params\.accounts?**: [`Address`](../classes/Address.md)[]

• **params\.applicationArgs?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

• **params\.applicationID?**: [`Application`](../classes/Application.md)

• **params\.applications?**: [`Application`](../classes/Application.md)[]

• **params\.approvalProgram?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.assets?**: [`Asset`](../classes/Asset.md)[]

• **params\.clearStateProgram?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.extraProgramPages?**: [`uint64`](../type-aliases/uint64.md)

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.globalNumByteSlice?**: [`uint64`](../type-aliases/uint64.md)

• **params\.globalNumUint?**: [`uint64`](../type-aliases/uint64.md)

• **params\.localNumByteSlice?**: [`uint64`](../type-aliases/uint64.md)

• **params\.localNumUint?**: [`uint64`](../type-aliases/uint64.md)

• **params\.note?**: `string`

The note field for this transaction

• **params\.onCompletion?**: [`OnCompletion`](../enumerations/OnCompletion.md)

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

`void`

## Source

[types/global.d.ts:855](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L855)
