---
editUrl: false
next: false
prev: false
title: "PendingGroup"
---

## Constructors

### new PendingGroup()

> **new PendingGroup**(): [`PendingGroup`](PendingGroup.md)

#### Returns

[`PendingGroup`](PendingGroup.md)

## Methods

### addAppCall()

> **addAppCall**(`params`): `void`

#### Parameters

• **params**

• **params\.accounts?**: [`Address`](Address.md)[]

• **params\.applicationArgs?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

• **params\.applicationID?**: [`Application`](Application.md)

• **params\.applications?**: [`Application`](Application.md)[]

• **params\.approvalProgram?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.assets?**: [`Asset`](Asset.md)[]

• **params\.clearStateProgram?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.extraProgramPages?**: [`uint64`](../type-aliases/uint64.md)

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.globalNumByteSlice?**: [`uint64`](../type-aliases/uint64.md)

• **params\.globalNumUint?**: [`uint64`](../type-aliases/uint64.md)

• **params\.isFirstTxn?**: `boolean`

• **params\.localNumByteSlice?**: [`uint64`](../type-aliases/uint64.md)

• **params\.localNumUint?**: [`uint64`](../type-aliases/uint64.md)

• **params\.note?**: `string`

The note field for this transaction

• **params\.onCompletion?**: [`OnCompletion`](../enumerations/OnCompletion.md)

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:24](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L24)

***

### addAssetConfig()

> **addAssetConfig**(`params`): `void`

#### Parameters

• **params**

• **params\.configAsset**: [`Asset`](Asset.md)

• **params\.configAssetClawback?**: [`Address`](Address.md)

• **params\.configAssetFreeze?**: [`Address`](Address.md)

• **params\.configAssetManager?**: [`Address`](Address.md)

• **params\.configAssetReserve?**: [`Address`](Address.md)

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:34](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L34)

***

### addAssetCreation()

> **addAssetCreation**(`params`): `void`

#### Parameters

• **params**

• **params\.configAssetClawback?**: [`Address`](Address.md)

• **params\.configAssetDecimals?**: [`uint64`](../type-aliases/uint64.md)

• **params\.configAssetDefaultFrozen?**: [`uint64`](../type-aliases/uint64.md)

• **params\.configAssetFreeze?**: [`Address`](Address.md)

• **params\.configAssetManager?**: [`Address`](Address.md)

• **params\.configAssetMetadataHash?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetName?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetReserve?**: [`Address`](Address.md)

• **params\.configAssetTotal**: [`uint64`](../type-aliases/uint64.md)

• **params\.configAssetURL?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetUnitName?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:28](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L28)

***

### addAssetFreeze()

> **addAssetFreeze**(`params`): `void`

#### Parameters

• **params**

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.freezeAsset**: [`Asset`](Asset.md)

• **params\.freezeAssetAccount**: [`Address`](Address.md)

• **params\.freezeAssetFrozen**: `boolean`

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:36](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L36)

***

### addAssetTransfer()

> **addAssetTransfer**(`params`): `void`

#### Parameters

• **params**

• **params\.assetAmount**: [`uint64`](../type-aliases/uint64.md)

The amount of the asset being transferred

• **params\.assetCloseTo?**: [`Address`](Address.md)

The address to close the asset to

• **params\.assetReceiver**: [`Address`](Address.md)

The receiver of the asset

• **params\.assetSender?**: [`Address`](Address.md)

The clawback target

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

• **params\.xferAsset**: [`Asset`](Asset.md)

The asset being transfed

#### Returns

`void`

#### Source

[src/lib/contract.ts:26](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L26)

***

### addMethodCall()

> **addMethodCall**\<`ArgsType`, `ReturnType`\>(`params`): `void`

Adds ABI method to the pending transaction group. The two type arguments in combination with the
name argument are used to form the the method signature to ensure typesafety.

#### Type parameters

• **ArgsType**

A tuple type corresponding to the types of the method arguments

• **ReturnType**

The return type of the method

#### Parameters

• **params**

The parameters of the method call

• **params\.accounts?**: [`Address`](Address.md)[]

• **params\.applicationArgs?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

• **params\.applicationID?**: [`Application`](Application.md)

• **params\.applications?**: [`Application`](Application.md)[]

• **params\.approvalProgram?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.assets?**: [`Asset`](Asset.md)[]

• **params\.clearStateProgram?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.extraProgramPages?**: [`uint64`](../type-aliases/uint64.md)

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.globalNumByteSlice?**: [`uint64`](../type-aliases/uint64.md)

• **params\.globalNumUint?**: [`uint64`](../type-aliases/uint64.md)

• **params\.isFirstTxn?**: `boolean`

• **params\.localNumByteSlice?**: [`uint64`](../type-aliases/uint64.md)

• **params\.localNumUint?**: [`uint64`](../type-aliases/uint64.md)

• **params\.methodArgs?**: `ArgsType`

ABI method arguments

• **params\.name**: `string`

Name of the ABI method

• **params\.note?**: `string`

The note field for this transaction

• **params\.onCompletion?**: [`OnCompletion`](../enumerations/OnCompletion.md)

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:20](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L20)

***

### addOfflineKeyRegistration()

> **addOfflineKeyRegistration**(`params`): `void`

#### Parameters

• **params**

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:32](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L32)

***

### addOnlineKeyRegistration()

> **addOnlineKeyRegistration**(`params`): `void`

#### Parameters

• **params**

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.selectionPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

• **params\.stateProofPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.voteFirst**: [`uint64`](../type-aliases/uint64.md)

• **params\.voteKeyDilution**: [`uint64`](../type-aliases/uint64.md)

• **params\.voteLast**: [`uint64`](../type-aliases/uint64.md)

• **params\.votePK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Returns

`void`

#### Source

[src/lib/contract.ts:30](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L30)

***

### addPayment()

> **addPayment**(`params`): `void`

#### Parameters

• **params**

• **params\.amount?**: [`uint64`](../type-aliases/uint64.md)

The amount, in microALGO, to transfer

• **params\.closeRemainderTo?**: [`Address`](Address.md)

If set, bring the sender balance to 0 and send all remaining balance to this address

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.receiver?**: [`Address`](Address.md)

The address of the receiver

• **params\.rekeyTo?**: [`Address`](Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:22](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L22)

***

### submit()

> **submit**(): `void`

#### Returns

`void`

#### Source

[src/lib/contract.ts:38](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L38)
