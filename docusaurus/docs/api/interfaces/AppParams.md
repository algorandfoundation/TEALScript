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

[types/global.d.ts:593](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L593)

___

### applicationArgs

• `Optional` **applicationArgs**: [`bytes`](../modules.md#bytes)[]

#### Defined in

[types/global.d.ts:595](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L595)

___

### applicationID

• `Optional` **applicationID**: [`Application`](../classes/Application.md)

#### Defined in

[types/global.d.ts:591](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L591)

___

### applications

• `Optional` **applications**: [`Application`](../classes/Application.md)[]

#### Defined in

[types/global.d.ts:597](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L597)

___

### approvalProgram

• `Optional` **approvalProgram**: `string` \| `string` & \{ `__brand?`: ``"bytes"``  }

#### Defined in

[types/global.d.ts:594](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L594)

___

### assets

• `Optional` **assets**: [`Asset`](../classes/Asset.md)[]

#### Defined in

[types/global.d.ts:598](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L598)

___

### clearStateProgram

• `Optional` **clearStateProgram**: `string` \| `string` & \{ `__brand?`: ``"bytes"``  }

#### Defined in

[types/global.d.ts:596](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L596)

___

### extraProgramPages

• `Optional` **extraProgramPages**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Defined in

[types/global.d.ts:603](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L603)

___

### fee

• `Optional` **fee**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[fee](CommonTransactionParams.md#fee)

#### Defined in

[types/global.d.ts:512](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L512)

___

### globalNumByteSlice

• `Optional` **globalNumByteSlice**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Defined in

[types/global.d.ts:599](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L599)

___

### globalNumUint

• `Optional` **globalNumUint**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Defined in

[types/global.d.ts:600](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L600)

___

### localNumByteSlice

• `Optional` **localNumByteSlice**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Defined in

[types/global.d.ts:601](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L601)

___

### localNumUint

• `Optional` **localNumUint**: `number` \| `number` & \{ `__brand?`: ``"uint64"``  }

#### Defined in

[types/global.d.ts:602](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L602)

___

### note

• `Optional` **note**: `string`

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[note](CommonTransactionParams.md#note)

#### Defined in

[types/global.d.ts:515](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L515)

___

### onCompletion

• `Optional` **onCompletion**: [`NoOp`](../enums/OnCompletion.md#noop) \| [`OptIn`](../enums/OnCompletion.md#optin) \| [`CloseOut`](../enums/OnCompletion.md#closeout) \| [`ClearState`](../enums/OnCompletion.md#clearstate) \| [`UpdateApplication`](../enums/OnCompletion.md#updateapplication) \| [`DeleteApplication`](../enums/OnCompletion.md#deleteapplication)

#### Defined in

[types/global.d.ts:592](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L592)

___

### rekeyTo

• `Optional` **rekeyTo**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[rekeyTo](CommonTransactionParams.md#rekeyto)

#### Defined in

[types/global.d.ts:514](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L514)

___

### sender

• `Optional` **sender**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonTransactionParams](CommonTransactionParams.md).[sender](CommonTransactionParams.md#sender)

#### Defined in

[types/global.d.ts:513](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L513)
