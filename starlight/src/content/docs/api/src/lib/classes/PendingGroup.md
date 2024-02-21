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

• **params\.accounts?**: [`Address`](../../../types/global/classes/Address.md)[]

• **params\.applicationArgs?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

• **params\.applicationID?**: [`Application`](../../../types/global/classes/Application.md)

• **params\.applications?**: [`Application`](../../../types/global/classes/Application.md)[]

• **params\.approvalProgram?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.assets?**: [`Asset`](../../../types/global/classes/Asset.md)[]

• **params\.clearStateProgram?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.extraProgramPages?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.globalNumByteSlice?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.globalNumUint?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.isFirstTxn?**: `boolean`

• **params\.localNumByteSlice?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.localNumUint?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.note?**: `string`

The note field for this transaction

• **params\.onCompletion?**: [`OnCompletion`](../../../types/global/enumerations/OnCompletion.md)

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:24](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L24)

***

### addAssetConfig()

> **addAssetConfig**(`params`): `void`

#### Parameters

• **params**

• **params\.configAsset**: [`Asset`](../../../types/global/classes/Asset.md)

• **params\.configAssetClawback?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetFreeze?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetManager?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetReserve?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:34](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L34)

***

### addAssetCreation()

> **addAssetCreation**(`params`): `void`

#### Parameters

• **params**

• **params\.configAssetClawback?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetDecimals?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.configAssetDefaultFrozen?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.configAssetFreeze?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetManager?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetMetadataHash?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetName?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetReserve?**: [`Address`](../../../types/global/classes/Address.md)

• **params\.configAssetTotal**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.configAssetURL?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetUnitName?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:28](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L28)

***

### addAssetFreeze()

> **addAssetFreeze**(`params`): `void`

#### Parameters

• **params**

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.freezeAsset**: [`Asset`](../../../types/global/classes/Asset.md)

• **params\.freezeAssetAccount**: [`Address`](../../../types/global/classes/Address.md)

• **params\.freezeAssetFrozen**: `boolean`

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:36](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L36)

***

### addAssetTransfer()

> **addAssetTransfer**(`params`): `void`

#### Parameters

• **params**

• **params\.assetAmount**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The amount of the asset being transferred

• **params\.assetCloseTo?**: [`Address`](../../../types/global/classes/Address.md)

The address to close the asset to

• **params\.assetReceiver**: [`Address`](../../../types/global/classes/Address.md)

The receiver of the asset

• **params\.assetSender?**: [`Address`](../../../types/global/classes/Address.md)

The clawback target

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

• **params\.xferAsset**: [`Asset`](../../../types/global/classes/Asset.md)

The asset being transfed

#### Returns

`void`

#### Source

[src/lib/contract.ts:26](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L26)

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

• **params\.accounts?**: [`Address`](../../../types/global/classes/Address.md)[]

• **params\.applicationArgs?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

• **params\.applicationID?**: [`Application`](../../../types/global/classes/Application.md)

• **params\.applications?**: [`Application`](../../../types/global/classes/Application.md)[]

• **params\.approvalProgram?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.assets?**: [`Asset`](../../../types/global/classes/Asset.md)[]

• **params\.clearStateProgram?**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.extraProgramPages?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.globalNumByteSlice?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.globalNumUint?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.isFirstTxn?**: `boolean`

• **params\.localNumByteSlice?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.localNumUint?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.methodArgs?**: `ArgsType`

ABI method arguments

• **params\.name**: `string`

Name of the ABI method

• **params\.note?**: `string`

The note field for this transaction

• **params\.onCompletion?**: [`OnCompletion`](../../../types/global/enumerations/OnCompletion.md)

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:20](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L20)

***

### addOfflineKeyRegistration()

> **addOfflineKeyRegistration**(`params`): `void`

#### Parameters

• **params**

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:32](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L32)

***

### addOnlineKeyRegistration()

> **addOnlineKeyRegistration**(`params`): `void`

#### Parameters

• **params**

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.selectionPK**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

• **params\.stateProofPK**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.voteFirst**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.voteKeyDilution**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.voteLast**: [`uint64`](../../../types/global/type-aliases/uint64.md)

• **params\.votePK**: [`Brand`](../../../types/global/type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Returns

`void`

#### Source

[src/lib/contract.ts:30](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L30)

***

### addPayment()

> **addPayment**(`params`): `void`

#### Parameters

• **params**

• **params\.amount?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The amount, in microALGO, to transfer

• **params\.closeRemainderTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, bring the sender balance to 0 and send all remaining balance to this address

• **params\.fee?**: [`uint64`](../../../types/global/type-aliases/uint64.md)

The fee paid for this transaction

• **params\.isFirstTxn?**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.receiver?**: [`Address`](../../../types/global/classes/Address.md)

The address of the receiver

• **params\.rekeyTo?**: [`Address`](../../../types/global/classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../../../types/global/classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Returns

`void`

#### Source

[src/lib/contract.ts:22](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L22)

***

### submit()

> **submit**(): `void`

#### Returns

`void`

#### Source

[src/lib/contract.ts:38](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/src/lib/contract.ts#L38)
