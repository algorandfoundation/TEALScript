---
editUrl: false
next: false
prev: false
title: "sendMethodCall"
---

> **sendMethodCall**\<`ArgsType`, `ReturnType`\>(`params`): `ReturnType`

Sends ABI method call. The two type arguments in combination with the
name argument are used to form the the method signature to ensure typesafety.

## Type parameters

• **ArgsType**

A tuple type corresponding to the types of the method arguments

• **ReturnType**

The return type of the method

## Parameters

• **params**

The parameters of the method call

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

• **params\.methodArgs?**: `ArgsType`

ABI method arguments

• **params\.name**: `string`

Name of the ABI method

• **params\.note?**: `string`

The note field for this transaction

• **params\.onCompletion?**: [`OnCompletion`](../enumerations/OnCompletion.md)

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

`ReturnType`

The return value of the method call

## Example

Calling a method and getting the return value
```ts
// call createNFT(string,string)uint64
const createdAsset = sendMethodCall<[string, string], Asset>({
    applicationID: factoryApp,
    name: 'createNFT',
    methodArgs: ['My NFT', 'MNFT'],
});
```

## Source

[types/global.d.ts:896](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L896)
