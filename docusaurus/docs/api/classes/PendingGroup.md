---
id: "PendingGroup"
title: "Class: PendingGroup"
sidebar_label: "PendingGroup"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new PendingGroup**()

## Methods

### addAppCall

▸ **addAppCall**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.accounts?` | [`Address`](Address.md)[] |
| `params.applicationArgs?` | [`bytes`](../modules.md#bytes)[] |
| `params.applicationID?` | [`Application`](Application.md) |
| `params.applications?` | [`Application`](Application.md)[] |
| `params.approvalProgram?` | [`bytes`](../modules.md#bytes) |
| `params.assets?` | [`Asset`](Asset.md)[] |
| `params.clearStateProgram?` | [`bytes`](../modules.md#bytes) |
| `params.extraProgramPages?` | [`uint64`](../modules.md#uint64) |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.globalNumByteSlice?` | [`uint64`](../modules.md#uint64) |
| `params.globalNumUint?` | [`uint64`](../modules.md#uint64) |
| `params.localNumByteSlice?` | [`uint64`](../modules.md#uint64) |
| `params.localNumUint?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.onCompletion?` | ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"`` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:23](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L23)

___

### addAssetConfig

▸ **addAssetConfig**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.configAsset` | [`Asset`](Asset.md) |
| `params.configAssetClawback?` | [`Address`](Address.md) |
| `params.configAssetFreeze?` | [`Address`](Address.md) |
| `params.configAssetManager?` | [`Address`](Address.md) |
| `params.configAssetReserve?` | [`Address`](Address.md) |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:33](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L33)

___

### addAssetCreation

▸ **addAssetCreation**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.configAssetClawback?` | [`Address`](Address.md) |
| `params.configAssetDecimals?` | [`uint64`](../modules.md#uint64) |
| `params.configAssetDefaultFrozen?` | [`uint64`](../modules.md#uint64) |
| `params.configAssetFreeze?` | [`Address`](Address.md) |
| `params.configAssetManager?` | [`Address`](Address.md) |
| `params.configAssetMetadataHash?` | [`bytes`](../modules.md#bytes) |
| `params.configAssetName?` | [`bytes`](../modules.md#bytes) |
| `params.configAssetReserve?` | [`Address`](Address.md) |
| `params.configAssetTotal` | [`uint64`](../modules.md#uint64) |
| `params.configAssetURL?` | [`bytes`](../modules.md#bytes) |
| `params.configAssetUnitName?` | [`bytes`](../modules.md#bytes) |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:27](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L27)

___

### addAssetFreeze

▸ **addAssetFreeze**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.freezeAsset` | [`Asset`](Asset.md) |
| `params.freezeAssetAccount` | [`Address`](Address.md) |
| `params.freezeAssetFrozen` | `boolean` |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:35](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L35)

___

### addAssetTransfer

▸ **addAssetTransfer**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.assetAmount` | [`uint64`](../modules.md#uint64) |
| `params.assetCloseTo?` | [`Address`](Address.md) |
| `params.assetReceiver` | [`Address`](Address.md) |
| `params.assetSender?` | [`Address`](Address.md) |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |
| `params.xferAsset` | [`Asset`](Asset.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:25](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L25)

___

### addMethodCall

▸ **addMethodCall**<`ArgsType`, `ReturnType`\>(`params`): `void`

Adds ABI method to the pending transaction group. The two type arguments in combination with the
name argument are used to form the the method signature to ensure typesafety.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `ArgsType` | A tuple type corresponding to the types of the method arguments |
| `ReturnType` | The return type of the method |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | The parameters of the method call |
| `params.accounts?` | [`Address`](Address.md)[] | - |
| `params.applicationArgs?` | [`bytes`](../modules.md#bytes)[] | - |
| `params.applicationID?` | [`Application`](Application.md) | - |
| `params.applications?` | [`Application`](Application.md)[] | - |
| `params.approvalProgram?` | [`bytes`](../modules.md#bytes) | - |
| `params.assets?` | [`Asset`](Asset.md)[] | - |
| `params.clearStateProgram?` | [`bytes`](../modules.md#bytes) | - |
| `params.extraProgramPages?` | [`uint64`](../modules.md#uint64) | - |
| `params.fee?` | [`uint64`](../modules.md#uint64) | - |
| `params.globalNumByteSlice?` | [`uint64`](../modules.md#uint64) | - |
| `params.globalNumUint?` | [`uint64`](../modules.md#uint64) | - |
| `params.localNumByteSlice?` | [`uint64`](../modules.md#uint64) | - |
| `params.localNumUint?` | [`uint64`](../modules.md#uint64) | - |
| `params.methodArgs?` | `ArgsType` | ABI method arguments |
| `params.name` | `string` | Name of the ABI method |
| `params.note?` | `string` | - |
| `params.onCompletion?` | ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"`` | - |
| `params.rekeyTo?` | [`Address`](Address.md) | - |
| `params.sender?` | [`Address`](Address.md) | - |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:19](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L19)

___

### addOfflineKeyRegistration

▸ **addOfflineKeyRegistration**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:31](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L31)

___

### addOnlineKeyRegistration

▸ **addOnlineKeyRegistration**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.selectionPK` | [`bytes`](../modules.md#bytes) |
| `params.sender?` | [`Address`](Address.md) |
| `params.stateProofPK` | [`bytes`](../modules.md#bytes) |
| `params.voteFirst` | [`uint64`](../modules.md#uint64) |
| `params.voteKeyDilution` | [`uint64`](../modules.md#uint64) |
| `params.voteLast` | [`uint64`](../modules.md#uint64) |
| `params.votePK` | [`bytes`](../modules.md#bytes) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:29](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L29)

___

### addPayment

▸ **addPayment**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.amount` | [`uint64`](../modules.md#uint64) |
| `params.closeRemainderTo?` | [`Address`](Address.md) |
| `params.fee?` | [`uint64`](../modules.md#uint64) |
| `params.note?` | `string` |
| `params.receiver` | [`Address`](Address.md) |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:21](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L21)

___

### submit

▸ **submit**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:37](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L37)
