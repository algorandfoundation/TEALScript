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

[types/global.d.ts:557](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L557)

___

### applicationArgs

• `Optional` **applicationArgs**: [`bytes`](../modules.md#bytes)[]

#### Defined in

[types/global.d.ts:559](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L559)

___

### applicationID

• `Optional` **applicationID**: [`Application`](../classes/Application.md)

#### Defined in

[types/global.d.ts:555](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L555)

___

### applications

• `Optional` **applications**: [`Application`](../classes/Application.md)[]

#### Defined in

[types/global.d.ts:561](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L561)

___

### approvalProgram

• `Optional` **approvalProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:558](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L558)

___

### assets

• `Optional` **assets**: [`Asset`](../classes/Asset.md)[]

#### Defined in

[types/global.d.ts:562](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L562)

___

### clearStateProgram

• `Optional` **clearStateProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:560](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L560)

___

### extraProgramPages

• `Optional` **extraProgramPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:567](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L567)

___

### fee

• `Optional` **fee**: [`uint64`](../modules.md#uint64)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[fee](CommonTransactionParams.md#fee)

#### Defined in

[types/global.d.ts:487](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L487)

___

### globalNumByteSlice

• `Optional` **globalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:563](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L563)

___

### globalNumUint

• `Optional` **globalNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:564](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L564)

___

### localNumByteSlice

• `Optional` **localNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:565](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L565)

___

### localNumUint

• `Optional` **localNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:566](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L566)

___

### note

• `Optional` **note**: `string`

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[note](CommonTransactionParams.md#note)

#### Defined in

[types/global.d.ts:490](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L490)

___

### onCompletion

• `Optional` **onCompletion**: ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"``

#### Defined in

[types/global.d.ts:556](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L556)

___

### rekeyTo

• `Optional` **rekeyTo**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[rekeyTo](CommonTransactionParams.md#rekeyto)

#### Defined in

[types/global.d.ts:489](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L489)

___

### sender

• `Optional` **sender**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[sender](CommonTransactionParams.md#sender)

#### Defined in

[types/global.d.ts:488](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L488)
