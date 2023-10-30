---
id: "AppParams"
title: "Interface: AppParams"
sidebar_label: "AppParams"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`CommonTransactionParams`](CommonTransactionParams.md)

  ↳ **`AppParams`**

  ↳↳ [`MethodCallParams`](MethodCallParams.md)

## Properties

### accounts

• `Optional` **accounts**: [`Address`](../classes/Address.md)[]

#### Defined in

[types/global.d.ts:565](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L565)

___

### applicationArgs

• `Optional` **applicationArgs**: [`bytes`](../modules.md#bytes)[]

#### Defined in

[types/global.d.ts:567](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L567)

___

### applicationID

• `Optional` **applicationID**: [`Application`](../classes/Application.md)

#### Defined in

[types/global.d.ts:556](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L556)

___

### applications

• `Optional` **applications**: [`Application`](../classes/Application.md)[]

#### Defined in

[types/global.d.ts:569](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L569)

___

### approvalProgram

• `Optional` **approvalProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:566](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L566)

___

### assets

• `Optional` **assets**: [`Asset`](../classes/Asset.md)[]

#### Defined in

[types/global.d.ts:570](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L570)

___

### clearStateProgram

• `Optional` **clearStateProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:568](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L568)

___

### extraProgramPages

• `Optional` **extraProgramPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:575](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L575)

___

### fee

• `Optional` **fee**: [`uint64`](../modules.md#uint64)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[fee](CommonTransactionParams.md#fee)

#### Defined in

[types/global.d.ts:488](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L488)

___

### globalNumByteSlice

• `Optional` **globalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:571](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L571)

___

### globalNumUint

• `Optional` **globalNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:572](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L572)

___

### localNumByteSlice

• `Optional` **localNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:573](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L573)

___

### localNumUint

• `Optional` **localNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:574](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L574)

___

### note

• `Optional` **note**: `string`

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[note](CommonTransactionParams.md#note)

#### Defined in

[types/global.d.ts:491](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L491)

___

### onCompletion

• `Optional` **onCompletion**: ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"``

#### Defined in

[types/global.d.ts:557](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L557)

___

### rekeyTo

• `Optional` **rekeyTo**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[rekeyTo](CommonTransactionParams.md#rekeyto)

#### Defined in

[types/global.d.ts:490](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L490)

___

### sender

• `Optional` **sender**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[sender](CommonTransactionParams.md#sender)

#### Defined in

[types/global.d.ts:489](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L489)
