---
id: "MethodCallParams"
title: "Interface: MethodCallParams<ArgsType>"
sidebar_label: "MethodCallParams"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name |
| :------ |
| `ArgsType` |

## Hierarchy

- [`AppParams`](AppParams.md)

  ↳ **`MethodCallParams`**

## Properties

### accounts

• `Optional` **accounts**: [`Address`](../classes/Address.md)[]

#### Inherited from

[AppParams](AppParams.md).[accounts](AppParams.md#accounts)

#### Defined in

[types/global.d.ts:557](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L557)

___

### applicationArgs

• `Optional` **applicationArgs**: [`bytes`](../modules.md#bytes)[]

#### Inherited from

[AppParams](AppParams.md).[applicationArgs](AppParams.md#applicationargs)

#### Defined in

[types/global.d.ts:559](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L559)

___

### applicationID

• `Optional` **applicationID**: [`Application`](../classes/Application.md)

#### Inherited from

[AppParams](AppParams.md).[applicationID](AppParams.md#applicationid)

#### Defined in

[types/global.d.ts:555](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L555)

___

### applications

• `Optional` **applications**: [`Application`](../classes/Application.md)[]

#### Inherited from

[AppParams](AppParams.md).[applications](AppParams.md#applications)

#### Defined in

[types/global.d.ts:561](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L561)

___

### approvalProgram

• `Optional` **approvalProgram**: [`bytes`](../modules.md#bytes)

#### Inherited from

[AppParams](AppParams.md).[approvalProgram](AppParams.md#approvalprogram)

#### Defined in

[types/global.d.ts:558](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L558)

___

### assets

• `Optional` **assets**: [`Asset`](../classes/Asset.md)[]

#### Inherited from

[AppParams](AppParams.md).[assets](AppParams.md#assets)

#### Defined in

[types/global.d.ts:562](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L562)

___

### clearStateProgram

• `Optional` **clearStateProgram**: [`bytes`](../modules.md#bytes)

#### Inherited from

[AppParams](AppParams.md).[clearStateProgram](AppParams.md#clearstateprogram)

#### Defined in

[types/global.d.ts:560](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L560)

___

### extraProgramPages

• `Optional` **extraProgramPages**: [`uint64`](../modules.md#uint64)

#### Inherited from

[AppParams](AppParams.md).[extraProgramPages](AppParams.md#extraprogrampages)

#### Defined in

[types/global.d.ts:567](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L567)

___

### fee

• `Optional` **fee**: [`uint64`](../modules.md#uint64)

#### Inherited from

[AppParams](AppParams.md).[fee](AppParams.md#fee)

#### Defined in

[types/global.d.ts:487](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L487)

___

### globalNumByteSlice

• `Optional` **globalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Inherited from

[AppParams](AppParams.md).[globalNumByteSlice](AppParams.md#globalnumbyteslice)

#### Defined in

[types/global.d.ts:563](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L563)

___

### globalNumUint

• `Optional` **globalNumUint**: [`uint64`](../modules.md#uint64)

#### Inherited from

[AppParams](AppParams.md).[globalNumUint](AppParams.md#globalnumuint)

#### Defined in

[types/global.d.ts:564](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L564)

___

### localNumByteSlice

• `Optional` **localNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Inherited from

[AppParams](AppParams.md).[localNumByteSlice](AppParams.md#localnumbyteslice)

#### Defined in

[types/global.d.ts:565](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L565)

___

### localNumUint

• `Optional` **localNumUint**: [`uint64`](../modules.md#uint64)

#### Inherited from

[AppParams](AppParams.md).[localNumUint](AppParams.md#localnumuint)

#### Defined in

[types/global.d.ts:566](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L566)

___

### methodArgs

• `Optional` **methodArgs**: `ArgsType`

ABI method arguments

#### Defined in

[types/global.d.ts:597](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L597)

___

### name

• **name**: `string`

Name of the ABI method

#### Defined in

[types/global.d.ts:599](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L599)

___

### note

• `Optional` **note**: `string`

#### Inherited from

[AppParams](AppParams.md).[note](AppParams.md#note)

#### Defined in

[types/global.d.ts:490](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L490)

___

### onCompletion

• `Optional` **onCompletion**: ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"``

#### Inherited from

[AppParams](AppParams.md).[onCompletion](AppParams.md#oncompletion)

#### Defined in

[types/global.d.ts:556](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L556)

___

### rekeyTo

• `Optional` **rekeyTo**: [`Address`](../classes/Address.md)

#### Inherited from

[AppParams](AppParams.md).[rekeyTo](AppParams.md#rekeyto)

#### Defined in

[types/global.d.ts:489](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L489)

___

### sender

• `Optional` **sender**: [`Address`](../classes/Address.md)

#### Inherited from

[AppParams](AppParams.md).[sender](AppParams.md#sender)

#### Defined in

[types/global.d.ts:488](https://github.com/algorand-devrel/tealscript/blob/5612951/types/global.d.ts#L488)
