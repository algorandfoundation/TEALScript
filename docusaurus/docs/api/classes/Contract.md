---
id: "Contract"
title: "Class: Contract"
sidebar_label: "Contract"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Contract**()

## Properties

### app

• **app**: [`Application`](Application.md)

#### Defined in

[src/lib/contract.ts:68](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L68)

___

### itxn

• **itxn**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accounts?` | [`Address`](Address.md)[] |
| `amount?` | [`uint64`](../modules.md#uint64) |
| `applicationArgs?` | [`bytes`](../modules.md#bytes)[] |
| `applicationID` | [`Application`](Application.md) |
| `applications?` | [`Application`](Application.md)[] |
| `approvalProgram?` | [`bytes`](../modules.md#bytes) |
| `assetAmount?` | [`uint64`](../modules.md#uint64) |
| `assetCloseTo?` | [`Address`](Address.md) |
| `assetReceiver?` | [`Address`](Address.md) |
| `assetSender?` | [`Address`](Address.md) |
| `assets?` | [`Asset`](Asset.md)[] |
| `clearStateProgram?` | [`bytes`](../modules.md#bytes) |
| `closeRemainderTo?` | [`Address`](Address.md) |
| `configAssetClawback?` | [`Address`](Address.md) |
| `configAssetDecimals?` | [`uint64`](../modules.md#uint64) |
| `configAssetDefaultFrozen?` | [`uint64`](../modules.md#uint64) |
| `configAssetFreeze?` | [`Address`](Address.md) |
| `configAssetManager?` | [`Address`](Address.md) |
| `configAssetMetadataHash?` | [`bytes`](../modules.md#bytes) |
| `configAssetName?` | [`bytes`](../modules.md#bytes) |
| `configAssetReserve?` | [`Address`](Address.md) |
| `configAssetTotal?` | [`uint64`](../modules.md#uint64) |
| `configAssetURL?` | [`bytes`](../modules.md#bytes) |
| `configAssetUnitName?` | [`bytes`](../modules.md#bytes) |
| `createdApplicationID` | [`Application`](Application.md) |
| `createdAssetID` | [`Asset`](Asset.md) |
| `extraProgramPages?` | [`uint64`](../modules.md#uint64) |
| `fee` | `Object` |
| `globalNumByteSlice?` | [`uint64`](../modules.md#uint64) |
| `globalNumUint?` | [`uint64`](../modules.md#uint64) |
| `groupIndex` | [`uint64`](../modules.md#uint64) |
| `lastLog` | [`bytes`](../modules.md#bytes) |
| `localNumByteSlice?` | [`uint64`](../modules.md#uint64) |
| `localNumUint?` | [`uint64`](../modules.md#uint64) |
| `note` | `string` |
| `numAccounts` | [`uint64`](../modules.md#uint64) |
| `numAppArgs` | [`uint64`](../modules.md#uint64) |
| `numApplicatons` | [`uint64`](../modules.md#uint64) |
| `numApprovalProgrammPages` | [`uint64`](../modules.md#uint64) |
| `numAssets` | [`uint64`](../modules.md#uint64) |
| `numClearStateProgramPages` | [`uint64`](../modules.md#uint64) |
| `numLogs` | [`uint64`](../modules.md#uint64) |
| `onCompletion?` | ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"`` |
| `receiver?` | [`Address`](Address.md) |
| `rekeyTo` | [`Address`](Address.md) |
| `sender` | [`Address`](Address.md) |
| `txID` | `string` |
| `xferAsset?` | [`Asset`](Asset.md) |

#### Defined in

[src/lib/contract.ts:56](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L56)

___

### pendingGroup

• **pendingGroup**: [`PendingGroup`](PendingGroup.md)

#### Defined in

[src/lib/contract.ts:70](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L70)

___

### txn

• **txn**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accounts?` | [`Address`](Address.md)[] |
| `applicationArgs?` | [`bytes`](../modules.md#bytes)[] |
| `applicationID` | [`Application`](Application.md) |
| `applications?` | [`Application`](Application.md)[] |
| `approvalProgram?` | [`bytes`](../modules.md#bytes) |
| `assets?` | [`Asset`](Asset.md)[] |
| `clearStateProgram?` | [`bytes`](../modules.md#bytes) |
| `createdApplicationID` | [`Application`](Application.md) |
| `createdAssetID` | [`Asset`](Asset.md) |
| `extraProgramPages?` | [`uint64`](../modules.md#uint64) |
| `fee` | `Object` |
| `globalNumByteSlice?` | [`uint64`](../modules.md#uint64) |
| `globalNumUint?` | [`uint64`](../modules.md#uint64) |
| `groupIndex` | [`uint64`](../modules.md#uint64) |
| `lastLog` | [`bytes`](../modules.md#bytes) |
| `localNumByteSlice?` | [`uint64`](../modules.md#uint64) |
| `localNumUint?` | [`uint64`](../modules.md#uint64) |
| `note` | `string` |
| `numAccounts` | [`uint64`](../modules.md#uint64) |
| `numAppArgs` | [`uint64`](../modules.md#uint64) |
| `numApplicatons` | [`uint64`](../modules.md#uint64) |
| `numApprovalProgrammPages` | [`uint64`](../modules.md#uint64) |
| `numAssets` | [`uint64`](../modules.md#uint64) |
| `numClearStateProgramPages` | [`uint64`](../modules.md#uint64) |
| `numLogs` | [`uint64`](../modules.md#uint64) |
| `onCompletion?` | ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"`` |
| `rekeyTo` | [`Address`](Address.md) |
| `sender` | [`Address`](Address.md) |
| `txID` | `string` |

#### Defined in

[src/lib/contract.ts:64](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L64)

___

### txnGroup

• **txnGroup**: [`Txn`](../modules.md#txn)[]

#### Defined in

[src/lib/contract.ts:66](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L66)

___

### approvalProgram

▪ `Static` **approvalProgram**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/contract.ts:41](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L41)

___

### clearProgram

▪ `Static` **clearProgram**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/contract.ts:43](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L43)

___

### schema

▪ `Static` **schema**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `global` | { `numByteSlice`: `number` ; `numUint`: `number`  } |
| `global.numByteSlice` | `number` |
| `global.numUint` | `number` |
| `local` | { `numByteSlice`: `number` ; `numUint`: `number`  } |
| `local.numByteSlice` | `number` |
| `local.numUint` | `number` |

#### Defined in

[src/lib/contract.ts:45](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L45)

## Methods

### clearState

▸ **clearState**(): `void`

The method called when an account clears their local state. The default ClearState
method does nothing. ClearState will always allow a user to delete their local state,
reagrdless of logic.

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:120](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L120)

___

### closeOutOfApplication

▸ **closeOutOfApplication**(`...args`): `void`

The method called when an account closes out their local state. The default close-out method
will always throw an error

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:111](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L111)

___

### createApplication

▸ **createApplication**(`...args`): `void`

The method called when creating the application. The default create method will
allow the contract to be created via a bare NoOp appcall and throw an error if called
with any arguments.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:77](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L77)

___

### deleteApplication

▸ **deleteApplication**(`...args`): `void`

The method called when attempting to delete the application. The default delete method will
always throw an error

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:95](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L95)

___

### optInToApplication

▸ **optInToApplication**(`...args`): `void`

The method called when an account opts-in to the application. The default opt-in method will
always throw an error

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:103](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L103)

___

### updateApplication

▸ **updateApplication**(`...args`): `void`

The method called when attempting to update the application. The default update method will
always throw an error

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:87](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/contract.ts#L87)
