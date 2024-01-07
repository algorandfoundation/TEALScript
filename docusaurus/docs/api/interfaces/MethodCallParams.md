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

[types/global.d.ts:593](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L593)

___

### applicationArgs

• `Optional` **applicationArgs**: [`bytes`](../modules.md#bytes)[]

#### Inherited from

[AppParams](AppParams.md).[applicationArgs](AppParams.md#applicationargs)

#### Defined in

[types/global.d.ts:595](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L595)

___

### applicationID

• `Optional` **applicationID**: [`Application`](../classes/Application.md)

#### Inherited from

[AppParams](AppParams.md).[applicationID](AppParams.md#applicationid)

#### Defined in

[types/global.d.ts:591](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L591)

___

### applications

• `Optional` **applications**: [`Application`](../classes/Application.md)[]

#### Inherited from

[AppParams](AppParams.md).[applications](AppParams.md#applications)

#### Defined in

[types/global.d.ts:597](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L597)

___

### approvalProgram

• `Optional` **approvalProgram**: `string` \| `string` & \{ `__brand?`: ``"bytes"``  }

#### Inherited from

[AppParams](AppParams.md).[approvalProgram](AppParams.md#approvalprogram)

#### Defined in

[types/global.d.ts:594](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L594)

___

### assets

• `Optional` **assets**: [`Asset`](../classes/Asset.md)[]

#### Inherited from

[AppParams](AppParams.md).[assets](AppParams.md#assets)

#### Defined in

[types/global.d.ts:598](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L598)

___

### clearStateProgram

• `Optional` **clearStateProgram**: `string` \| `string` & \{ `__brand?`: ``"bytes"``  }

#### Inherited from

[AppParams](AppParams.md).[clearStateProgram](AppParams.md#clearstateprogram)

#### Defined in

[types/global.d.ts:596](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L596)

___

### extraProgramPages

• `Optional` **extraProgramPages**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[AppParams](AppParams.md).[extraProgramPages](AppParams.md#extraprogrampages)

#### Defined in

[types/global.d.ts:603](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L603)

___

### fee

• `Optional` **fee**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[AppParams](AppParams.md).[fee](AppParams.md#fee)

#### Defined in

[types/global.d.ts:512](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L512)

___

### globalNumByteSlice

• `Optional` **globalNumByteSlice**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[AppParams](AppParams.md).[globalNumByteSlice](AppParams.md#globalnumbyteslice)

#### Defined in

[types/global.d.ts:599](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L599)

___

### globalNumUint

• `Optional` **globalNumUint**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[AppParams](AppParams.md).[globalNumUint](AppParams.md#globalnumuint)

#### Defined in

[types/global.d.ts:600](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L600)

___

### localNumByteSlice

• `Optional` **localNumByteSlice**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[AppParams](AppParams.md).[localNumByteSlice](AppParams.md#localnumbyteslice)

#### Defined in

[types/global.d.ts:601](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L601)

___

### localNumUint

• `Optional` **localNumUint**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[AppParams](AppParams.md).[localNumUint](AppParams.md#localnumuint)

#### Defined in

[types/global.d.ts:602](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L602)

___

### methodArgs

• `Optional` **methodArgs**: `ArgsType`

ABI method arguments

#### Defined in

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L633)

___

### name

• **name**: `string`

Name of the ABI method

#### Defined in

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L635)

___

### note

• `Optional` **note**: `string`

#### Inherited from

[AppParams](AppParams.md).[note](AppParams.md#note)

#### Defined in

[types/global.d.ts:515](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L515)

___

### onCompletion

• `Optional` **onCompletion**: [`NoOp`](../enums/OnCompletion.md#noop) \| [`OptIn`](../enums/OnCompletion.md#optin) \| [`CloseOut`](../enums/OnCompletion.md#closeout) \| [`ClearState`](../enums/OnCompletion.md#clearstate) \| [`UpdateApplication`](../enums/OnCompletion.md#updateapplication) \| [`DeleteApplication`](../enums/OnCompletion.md#deleteapplication)

#### Inherited from

[AppParams](AppParams.md).[onCompletion](AppParams.md#oncompletion)

#### Defined in

[types/global.d.ts:592](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L592)

___

### rekeyTo

• `Optional` **rekeyTo**: [`Address`](../classes/Address.md)

#### Inherited from

[AppParams](AppParams.md).[rekeyTo](AppParams.md#rekeyto)

#### Defined in

[types/global.d.ts:514](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L514)

___

### sender

• `Optional` **sender**: [`Address`](../classes/Address.md)

#### Inherited from

[AppParams](AppParams.md).[sender](AppParams.md#sender)

#### Defined in

[types/global.d.ts:513](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L513)
