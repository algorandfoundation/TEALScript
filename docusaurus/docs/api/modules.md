---
id: "modules"
title: "@algorandfoundation/tealscript"
sidebar_label: "Table of Contents"
sidebar_position: 0.5
hide_table_of_contents: true
custom_edit_url: null
---

## Enumerations

- [TransactionType](enums/TransactionType.md)

## Classes

- [Address](classes/Address.md)
- [Application](classes/Application.md)
- [Asset](classes/Asset.md)
- [Contract](classes/Contract.md)
- [EventLogger](classes/EventLogger.md)
- [LogicSig](classes/LogicSig.md)
- [PendingGroup](classes/PendingGroup.md)
- [abi](classes/abi.md)
- [allow](classes/allow.md)
- [nonABIRouterFallback](classes/nonABIRouterFallback.md)

## Interfaces

- [AppOnChainTransactionParams](interfaces/AppOnChainTransactionParams.md)
- [AppParams](interfaces/AppParams.md)
- [AssetConfigParams](interfaces/AssetConfigParams.md)
- [AssetCreateParams](interfaces/AssetCreateParams.md)
- [AssetFreezeParams](interfaces/AssetFreezeParams.md)
- [AssetTransferParams](interfaces/AssetTransferParams.md)
- [CommonOnChainTransactionParams](interfaces/CommonOnChainTransactionParams.md)
- [CommonTransactionParams](interfaces/CommonTransactionParams.md)
- [KeyRegParams](interfaces/KeyRegParams.md)
- [MethodCallParams](interfaces/MethodCallParams.md)
- [OnlineKeyRegParams](interfaces/OnlineKeyRegParams.md)
- [PaymentParams](interfaces/PaymentParams.md)

## Type Aliases

### Account

Ƭ **Account**: [`Address`](classes/Address.md)

#### Defined in

[types/global.d.ts:405](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L405)

___

### AppCallTxn

Ƭ **AppCallTxn**: [`AppOnChainTransactionParams`](interfaces/AppOnChainTransactionParams.md) & `Required`<[`AppParams`](interfaces/AppParams.md)\>

#### Defined in

[types/global.d.ts:598](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L598)

___

### AssetConfigTxn

Ƭ **AssetConfigTxn**: `Required`<[`AssetConfigParams`](interfaces/AssetConfigParams.md)\>

#### Defined in

[types/global.d.ts:600](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L600)

___

### AssetFreezeTxn

Ƭ **AssetFreezeTxn**: `Required`<[`AssetFreezeParams`](interfaces/AssetFreezeParams.md)\>

#### Defined in

[types/global.d.ts:601](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L601)

___

### AssetTransferTxn

Ƭ **AssetTransferTxn**: `Required`<[`AssetTransferParams`](interfaces/AssetTransferParams.md)\>

#### Defined in

[types/global.d.ts:597](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L597)

___

### BoxValue

Ƭ **BoxValue**<`ValueType`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `ValueType` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `delete` | () => `void` |
| `exists` | `boolean` |
| `size` | [`uint64`](modules.md#uint64) |
| `value` | `ValueType` |
| `create` | (`size`: [`uint64`](modules.md#uint64)) => `void` |
| `extract` | (`offset`: [`uint64`](modules.md#uint64), `length`: [`uint64`](modules.md#uint64)) => [`bytes`](modules.md#bytes) |
| `replace` | (`offset`: [`uint64`](modules.md#uint64), `value`: [`bytes`](modules.md#bytes)) => `void` |

#### Defined in

[types/global.d.ts:443](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L443)

___

### Brand

Ƭ **Brand**<`K`, `T`\>: `K` & { `__brand?`: `T`  }

#### Type parameters

| Name |
| :------ |
| `K` |
| `T` |

#### Defined in

[types/global.d.ts:241](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L241)

___

### BytesLike

Ƭ **BytesLike**: [`bytes`](modules.md#bytes) \| [`Address`](classes/Address.md) \| `string`

#### Defined in

[types/global.d.ts:407](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L407)

___

### Expand

Ƭ **Expand**<`T`\>: `T` extends (...`args`: infer A) => infer R ? (...`args`: [`Expand`](modules.md#expand)<`A`\>) => [`Expand`](modules.md#expand)<`R`\> : `T` extends infer O ? { [K in keyof O]: O[K] } : `never`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[types/global.d.ts:6](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L6)

___

### GlobalStateValue

Ƭ **GlobalStateValue**<`ValueType`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `ValueType` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `delete` | () => `void` |
| `exists` | `boolean` |
| `value` | `ValueType` |

#### Defined in

[types/global.d.ts:460](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L460)

___

### InnerAppCall

Ƭ **InnerAppCall**: [`Expand`](modules.md#expand)<[`AppParams`](interfaces/AppParams.md)\>

#### Defined in

[types/global.d.ts:650](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L650)

___

### InnerAssetConfig

Ƭ **InnerAssetConfig**: [`Expand`](modules.md#expand)<[`AssetConfigParams`](interfaces/AssetConfigParams.md)\>

#### Defined in

[types/global.d.ts:652](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L652)

___

### InnerAssetCreation

Ƭ **InnerAssetCreation**: [`Expand`](modules.md#expand)<[`AssetCreateParams`](interfaces/AssetCreateParams.md)\>

#### Defined in

[types/global.d.ts:653](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L653)

___

### InnerAssetFreeze

Ƭ **InnerAssetFreeze**: [`Expand`](modules.md#expand)<[`AssetFreezeParams`](interfaces/AssetFreezeParams.md)\>

#### Defined in

[types/global.d.ts:654](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L654)

___

### InnerAssetTransfer

Ƭ **InnerAssetTransfer**: [`Expand`](modules.md#expand)<[`AssetTransferParams`](interfaces/AssetTransferParams.md)\>

#### Defined in

[types/global.d.ts:651](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L651)

___

### InnerMethodCall

Ƭ **InnerMethodCall**<`ArgsType`, `ReturnType`\>: [`Expand`](modules.md#expand)<[`MethodCallParams`](interfaces/MethodCallParams.md)<`ArgsType`\>\>

#### Type parameters

| Name |
| :------ |
| `ArgsType` |
| `ReturnType` |

#### Defined in

[types/global.d.ts:657](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L657)

___

### InnerOfflineKeyRegistration

Ƭ **InnerOfflineKeyRegistration**: [`Expand`](modules.md#expand)<[`CommonTransactionParams`](interfaces/CommonTransactionParams.md)\>

#### Defined in

[types/global.d.ts:656](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L656)

___

### InnerOnlineKeyRegistration

Ƭ **InnerOnlineKeyRegistration**: [`Expand`](modules.md#expand)<[`OnlineKeyRegParams`](interfaces/OnlineKeyRegParams.md)\>

#### Defined in

[types/global.d.ts:655](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L655)

___

### InnerPayment

Ƭ **InnerPayment**: [`Expand`](modules.md#expand)<[`PaymentParams`](interfaces/PaymentParams.md)\>

#### Defined in

[types/global.d.ts:649](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L649)

___

### IntLike

Ƭ **IntLike**: [`uint64`](modules.md#uint64) \| [`Asset`](classes/Asset.md) \| [`Application`](classes/Application.md) \| `boolean` \| `number`

#### Defined in

[types/global.d.ts:485](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L485)

___

### KeyRegTxn

Ƭ **KeyRegTxn**: `Required`<[`KeyRegParams`](interfaces/KeyRegParams.md)\>

#### Defined in

[types/global.d.ts:599](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L599)

___

### LocalStateValue

Ƭ **LocalStateValue**<`ValueType`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `ValueType` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `delete` | () => `void` |
| `exists` | `boolean` |
| `value` | `ValueType` |

#### Defined in

[types/global.d.ts:472](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L472)

___

### PayTxn

Ƭ **PayTxn**: `Required`<[`PaymentParams`](interfaces/PaymentParams.md)\>

#### Defined in

[types/global.d.ts:596](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L596)

___

### StaticArray

Ƭ **StaticArray**<`T`, `N`\>: `T` extends [`byte`](modules.md#byte) ? `string` : `N` extends ``0`` ? `never`[] : `T` extends `boolean` ? (`boolean`)[] : `T`[] & { `__length?`: `N` ; `__type?`: `T`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`BytesLike`](modules.md#byteslike) \| [`IntLike`](modules.md#intlike) \| [`StaticArray`](modules.md#staticarray) |
| `N` | extends `number` |

#### Defined in

[types/global.d.ts:912](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L912)

___

### ThisTxnParams

Ƭ **ThisTxnParams**: [`AppOnChainTransactionParams`](interfaces/AppOnChainTransactionParams.md) & [`AppParams`](interfaces/AppParams.md)

#### Defined in

[types/global.d.ts:610](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L610)

___

### Txn

Ƭ **Txn**: [`PayTxn`](modules.md#paytxn) & [`AssetTransferTxn`](modules.md#assettransfertxn) & [`AppCallTxn`](modules.md#appcalltxn) & [`KeyRegTxn`](modules.md#keyregtxn) & [`AssetConfigTxn`](modules.md#assetconfigtxn) & [`AssetFreezeTxn`](modules.md#assetfreezetxn) & { `typeEnum`: [`TransactionType`](enums/TransactionType.md)  }

#### Defined in

[types/global.d.ts:612](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L612)

___

### TxnVerificationFields

Ƭ **TxnVerificationFields**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accounts?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `amount?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `applicationArgs?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `applicationID?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `applications?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `approvalProgram?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `approvalProgramPages?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `assetAmount?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `assetCloseTo?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `assetReceiver?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `assetSender?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `assets?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `clearStateProgram?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `clearStateProgramPages?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `closeRemainderTo?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAsset?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetClawback?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetDecimals?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetDefaultFrozen?` | `boolean` \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetFreeze?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetManager?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetMetadataHash?` | [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\> \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetName?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetReserve?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetTotal?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetURL?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `configAssetUnitName?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `createdApplicationID?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `createdAssetID?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `extraProgramPages?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `fee?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `firstValid?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `firstValidTime?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `freezeAsset?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `freezeAssetAccount?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `freezeAssetFrozen?` | `boolean` \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `globalNumByteSlice?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `globalNumUint?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `groupIndex?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `lastLog?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `lastValid?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `lease?` | [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\> \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `localNumByteSlice?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `localNumUint?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `logs?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `nonparticipation?` | `boolean` \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `note?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numAccounts?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numAppArgs?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numApplications?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numApprovalProgramPages?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numAssets?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numClearStateProgramPages?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `numLogs?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `onCompletion?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `receiver?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `rekeyTo?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `selectionPK?` | [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\> \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `sender?` | [`Address`](classes/Address.md) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `stateProofPK?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `txID?` | [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\> \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `type?` | [`BytesLike`](modules.md#byteslike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `typeEnum?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `voteFirst?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `voteKeyDilution?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `voteLast?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `votePK?` | [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\> \| [`TxnVerificationTests`](modules.md#txnverificationtests) |
| `xferAsset?` | [`IntLike`](modules.md#intlike) \| [`TxnVerificationTests`](modules.md#txnverificationtests) |

#### Defined in

[types/global.d.ts:260](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L260)

___

### TxnVerificationTests

Ƭ **TxnVerificationTests**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `greaterThan?` | [`IntLike`](modules.md#intlike) |
| `greaterThanEqualTo?` | [`IntLike`](modules.md#intlike) |
| `includedIn?` | ([`IntLike`](modules.md#intlike) \| [`BytesLike`](modules.md#byteslike))[] |
| `lessThan?` | [`IntLike`](modules.md#intlike) |
| `lessThanEqualTo?` | [`IntLike`](modules.md#intlike) |
| `not?` | [`IntLike`](modules.md#intlike) \| [`BytesLike`](modules.md#byteslike) |
| `notIncludedIn?` | ([`IntLike`](modules.md#intlike) \| [`BytesLike`](modules.md#byteslike))[] |

#### Defined in

[types/global.d.ts:250](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L250)

___

### byte

Ƭ **byte**: [`Brand`](modules.md#brand)<`string`, ``"byte"``\>

#### Defined in

[types/global.d.ts:247](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L247)

___

### bytes

Ƭ **bytes**: [`Brand`](modules.md#brand)<`string`, ``"bytes"``\>

#### Defined in

[types/global.d.ts:248](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L248)

___

### decorator

Ƭ **decorator**: (`target`: `Object`, `key`: `string` \| `symbol`, `descriptor`: `PropertyDescriptor`) => `PropertyDescriptor`

#### Type declaration

▸ (`target`, `key`, `descriptor`): `PropertyDescriptor`

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Object` |
| `key` | `string` \| `symbol` |
| `descriptor` | `PropertyDescriptor` |

##### Returns

`PropertyDescriptor`

#### Defined in

[types/global.d.ts:876](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L876)

___

### precisions

Ƭ **precisions**: ``1`` \| ``2`` \| ``3`` \| ``4`` \| ``5`` \| ``6`` \| ``7`` \| ``8`` \| ``9`` \| ``10`` \| ``11`` \| ``12`` \| ``13`` \| ``14`` \| ``15`` \| ``16`` \| ``17`` \| ``18`` \| ``19`` \| ``20`` \| ``21`` \| ``22`` \| ``23`` \| ``24`` \| ``25`` \| ``26`` \| ``27`` \| ``28`` \| ``29`` \| ``30`` \| ``31`` \| ``32`` \| ``33`` \| ``34`` \| ``35`` \| ``36`` \| ``37`` \| ``38`` \| ``39`` \| ``40`` \| ``41`` \| ``42`` \| ``43`` \| ``44`` \| ``45`` \| ``46`` \| ``47`` \| ``48`` \| ``49`` \| ``50`` \| ``51`` \| ``52`` \| ``53`` \| ``54`` \| ``55`` \| ``56`` \| ``57`` \| ``58`` \| ``59`` \| ``60`` \| ``61`` \| ``62`` \| ``63`` \| ``64`` \| ``65`` \| ``66`` \| ``67`` \| ``68`` \| ``69`` \| ``70`` \| ``71`` \| ``72`` \| ``73`` \| ``74`` \| ``75`` \| ``76`` \| ``77`` \| ``78`` \| ``79`` \| ``80`` \| ``81`` \| ``82`` \| ``83`` \| ``84`` \| ``85`` \| ``86`` \| ``87`` \| ``88`` \| ``89`` \| ``90`` \| ``91`` \| ``92`` \| ``93`` \| ``94`` \| ``95`` \| ``96`` \| ``97`` \| ``98`` \| ``99`` \| ``100`` \| ``101`` \| ``102`` \| ``103`` \| ``104`` \| ``105`` \| ``106`` \| ``107`` \| ``108`` \| ``109`` \| ``110`` \| ``111`` \| ``112`` \| ``113`` \| ``114`` \| ``115`` \| ``116`` \| ``117`` \| ``118`` \| ``119`` \| ``120`` \| ``121`` \| ``122`` \| ``123`` \| ``124`` \| ``125`` \| ``126`` \| ``127`` \| ``128`` \| ``129`` \| ``130`` \| ``131`` \| ``132`` \| ``133`` \| ``134`` \| ``135`` \| ``136`` \| ``137`` \| ``138`` \| ``139`` \| ``140`` \| ``141`` \| ``142`` \| ``143`` \| ``144`` \| ``145`` \| ``146`` \| ``147`` \| ``148`` \| ``149`` \| ``150`` \| ``151`` \| ``152`` \| ``153`` \| ``154`` \| ``155`` \| ``156`` \| ``157`` \| ``158`` \| ``159`` \| ``160``

#### Defined in

[types/global.d.ts:78](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L78)

___

### ufixed

Ƭ **ufixed**<`N`, `M`\>: [`Brand`](modules.md#brand)<`number`, \`ufixed${N}x${M}\`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `N` | extends [`widths`](modules.md#widths) |
| `M` | extends [`precisions`](modules.md#precisions) |

#### Defined in

[types/global.d.ts:245](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L245)

___

### uint

Ƭ **uint**<`N`\>: [`Brand`](modules.md#brand)<`number`, \`uint${N}\`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `N` | extends [`widths`](modules.md#widths) |

#### Defined in

[types/global.d.ts:243](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L243)

___

### uint64

Ƭ **uint64**: [`uint`](modules.md#uint)<``64``\> \| `number`

#### Defined in

[types/global.d.ts:244](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L244)

___

### widths

Ƭ **widths**: ``8`` \| ``16`` \| ``24`` \| ``32`` \| ``40`` \| ``48`` \| ``56`` \| ``64`` \| ``72`` \| ``80`` \| ``88`` \| ``96`` \| ``104`` \| ``112`` \| ``120`` \| ``128`` \| ``136`` \| ``144`` \| ``152`` \| ``160`` \| ``168`` \| ``176`` \| ``184`` \| ``192`` \| ``200`` \| ``208`` \| ``216`` \| ``224`` \| ``232`` \| ``240`` \| ``248`` \| ``256`` \| ``264`` \| ``272`` \| ``280`` \| ``288`` \| ``296`` \| ``304`` \| ``312`` \| ``320`` \| ``328`` \| ``336`` \| ``344`` \| ``352`` \| ``360`` \| ``368`` \| ``376`` \| ``384`` \| ``392`` \| ``400`` \| ``408`` \| ``416`` \| ``424`` \| ``432`` \| ``440`` \| ``448`` \| ``456`` \| ``464`` \| ``472`` \| ``480`` \| ``488`` \| ``496`` \| ``504`` \| ``512``

#### Defined in

[types/global.d.ts:12](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L12)

## Variables

### globals

• `Const` **globals**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callerApplicationAddress` | [`Address`](classes/Address.md) |
| `callerApplicationID` | [`Application`](classes/Application.md) |
| `creatorAddress` | [`Address`](classes/Address.md) |
| `currentApplicationAddress` | [`Address`](classes/Address.md) |
| `currentApplicationID` | [`Application`](classes/Application.md) |
| `groupID` | [`bytes`](modules.md#bytes) |
| `groupSize` | [`uint64`](modules.md#uint64) |
| `latestTimestamp` | [`uint64`](modules.md#uint64) |
| `logicSigVersion` | [`uint64`](modules.md#uint64) |
| `maxTxnLife` | [`uint64`](modules.md#uint64) |
| `minBalance` | [`uint64`](modules.md#uint64) |
| `minTxnFee` | [`uint64`](modules.md#uint64) |
| `opcodeBudget` | [`uint64`](modules.md#uint64) |
| `round` | [`uint64`](modules.md#uint64) |
| `zeroAddress` | [`Address`](classes/Address.md) |

#### Defined in

[types/global.d.ts:619](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L619)

## Functions

### BoxKey

▸ **BoxKey**<`ValueType`\>(`options?`): [`BoxValue`](modules.md#boxvalue)<`ValueType`\>

#### Type parameters

| Name |
| :------ |
| `ValueType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.dynamicSize?` | `boolean` |
| `options.key?` | `string` |

#### Returns

[`BoxValue`](modules.md#boxvalue)<`ValueType`\>

#### Defined in

[types/global.d.ts:453](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L453)

___

### BoxMap

▸ **BoxMap**<`KeyType`, `ValueType`\>(`options?`): (`key`: `KeyType`) => [`BoxValue`](modules.md#boxvalue)<`ValueType`\>

#### Type parameters

| Name |
| :------ |
| `KeyType` |
| `ValueType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.dynamicSize?` | `boolean` |
| `options.prefix?` | `string` |

#### Returns

`fn`

▸ (`key`): [`BoxValue`](modules.md#boxvalue)<`ValueType`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `KeyType` |

##### Returns

[`BoxValue`](modules.md#boxvalue)<`ValueType`\>

#### Defined in

[types/global.d.ts:455](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L455)

___

### GlobalStateKey

▸ **GlobalStateKey**<`ValueType`\>(`options?`): [`GlobalStateValue`](modules.md#globalstatevalue)<`ValueType`\>

#### Type parameters

| Name |
| :------ |
| `ValueType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.key?` | `string` |

#### Returns

[`GlobalStateValue`](modules.md#globalstatevalue)<`ValueType`\>

#### Defined in

[types/global.d.ts:466](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L466)

___

### GlobalStateMap

▸ **GlobalStateMap**<`KeyType`, `ValueType`\>(`options`): (`key`: `KeyType`) => [`GlobalStateValue`](modules.md#globalstatevalue)<`ValueType`\>

#### Type parameters

| Name |
| :------ |
| `KeyType` |
| `ValueType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.maxKeys` | `number` |
| `options.prefix?` | `string` |

#### Returns

`fn`

▸ (`key`): [`GlobalStateValue`](modules.md#globalstatevalue)<`ValueType`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `KeyType` |

##### Returns

[`GlobalStateValue`](modules.md#globalstatevalue)<`ValueType`\>

#### Defined in

[types/global.d.ts:467](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L467)

___

### LocalStateKey

▸ **LocalStateKey**<`ValueType`\>(`options?`): (`account`: [`Address`](classes/Address.md)) => [`LocalStateValue`](modules.md#localstatevalue)<`ValueType`\>

#### Type parameters

| Name |
| :------ |
| `ValueType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `Object` |
| `options.key?` | `string` |

#### Returns

`fn`

▸ (`account`): [`LocalStateValue`](modules.md#localstatevalue)<`ValueType`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `account` | [`Address`](classes/Address.md) |

##### Returns

[`LocalStateValue`](modules.md#localstatevalue)<`ValueType`\>

#### Defined in

[types/global.d.ts:478](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L478)

___

### LocalStateMap

▸ **LocalStateMap**<`KeyType`, `ValueType`\>(`options`): (`account`: [`Address`](classes/Address.md), `key`: `KeyType`) => [`LocalStateValue`](modules.md#localstatevalue)<`ValueType`\>

#### Type parameters

| Name |
| :------ |
| `KeyType` |
| `ValueType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.maxKeys` | `number` |
| `options.prefix?` | `string` |

#### Returns

`fn`

▸ (`account`, `key`): [`LocalStateValue`](modules.md#localstatevalue)<`ValueType`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `account` | [`Address`](classes/Address.md) |
| `key` | `KeyType` |

##### Returns

[`LocalStateValue`](modules.md#localstatevalue)<`ValueType`\>

#### Defined in

[types/global.d.ts:480](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L480)

___

### addr

▸ **addr**(`address`): [`Address`](classes/Address.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

[`Address`](classes/Address.md)

#### Defined in

[types/global.d.ts:638](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L638)

___

### assert

▸ **assert**(`...conditions`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...conditions` | [`IntLike`](modules.md#intlike)[] |

#### Returns

`void`

**`Throws`**

if one of the given conditions is 0 or false

#### Defined in

[types/global.d.ts:722](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L722)

___

### bsqrt

▸ **bsqrt**(`arg0`): [`uint`](modules.md#uint)<[`widths`](modules.md#widths)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg0` | [`uint`](modules.md#uint)<[`widths`](modules.md#widths)\> |

#### Returns

[`uint`](modules.md#uint)<[`widths`](modules.md#widths)\>

square root of the given uintN

#### Defined in

[types/global.d.ts:828](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L828)

___

### btobigint

▸ **btobigint**(`input`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`BytesLike`](modules.md#byteslike) |

#### Returns

`number`

bytes interpreted as a number

#### Defined in

[types/global.d.ts:863](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L863)

___

### btoi

▸ **btoi**(`data`): [`uint64`](modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`uint64`](modules.md#uint64)

the input data converted to  [uint64](modules.md#uint64)

**`Throws`**

if the input data is longer than 8 bytes

#### Defined in

[types/global.d.ts:688](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L688)

___

### bzero

▸ **bzero**<`T`\>(`size?`): `T`

Returns zero bytes of the given size.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | [`bytes`](modules.md#bytes) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `size?` | [`IntLike`](modules.md#intlike) | the number of zero bytes to return. If not given, returns the size of the type given the type argument |

#### Returns

`T`

#### Defined in

[types/global.d.ts:849](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L849)

___

### castBytes

▸ **castBytes**<`T`\>(`input`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`BytesLike`](modules.md#byteslike) |

#### Returns

`T`

#### Defined in

[types/global.d.ts:933](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L933)

___

### clone

▸ **clone**<`T`\>(`input`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `T` |

#### Returns

`T`

#### Defined in

[types/global.d.ts:937](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L937)

___

### concat

▸ **concat**(`a`, `b`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`BytesLike`](modules.md#byteslike) |
| `b` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`bytes`](modules.md#bytes)

The concatenation of two [bytes](modules.md#bytes)

#### Defined in

[types/global.d.ts:725](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L725)

___

### divw

▸ **divw**(`dividendHigh`, `dividendLow`, `divisor`): [`uint64`](modules.md#uint64)

Combines two uint64 into one uint128 and then divides it by another uint64

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dividendHigh` | [`IntLike`](modules.md#intlike) | high bits of the dividend |
| `dividendLow` | [`IntLike`](modules.md#intlike) | low bits of the dividend |
| `divisor` | [`IntLike`](modules.md#intlike) | divisor |

#### Returns

[`uint64`](modules.md#uint64)

#### Defined in

[types/global.d.ts:837](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L837)

___

### ed25519verify

▸ **ed25519verify**(`data`, `signature`, `pubkey`): `boolean`

Verify the signature of ("ProgData" || program_hash || data) against the pubkey.
The program_hash is the hash of the program source code

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | Data be verified |
| `signature` | [`BytesLike`](modules.md#byteslike) | The signature to verify |
| `pubkey` | [`BytesLike`](modules.md#byteslike) | The public key to verify the signature with |

#### Returns

`boolean`

true if the signature is valid, false otherwise

#### Defined in

[types/global.d.ts:716](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L716)

___

### ed25519verify\_bare

▸ **ed25519verify_bare**(`message`, `signature`, `publicKey`): [`uint64`](modules.md#uint64)

Verifies the given signature against the given public key and message

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | [`BytesLike`](modules.md#byteslike) | message to verify |
| `signature` | [`BytesLike`](modules.md#byteslike) | signature to verify |
| `publicKey` | [`BytesLike`](modules.md#byteslike) | public key to verify the signature with |

#### Returns

[`uint64`](modules.md#uint64)

true if the signature is valid, false otherwise

#### Defined in

[types/global.d.ts:822](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L822)

___

### extract3

▸ **extract3**(`data`, `start`, `length`): [`bytes`](modules.md#bytes)

Extracts a subtstring of the given length starting at the given index

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | bytes to extract from |
| `start` | [`IntLike`](modules.md#intlike) | byte index to start extracting from |
| `length` | [`IntLike`](modules.md#intlike) | number of bytes to extract |

#### Returns

[`bytes`](modules.md#bytes)

extracted bytes

#### Defined in

[types/global.d.ts:770](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L770)

___

### extract\_uint16

▸ **extract_uint16**(`data`, `byteIndex`): [`uint64`](modules.md#uint64)

Extracts 2 bytes from the given data starting at the given index and converts them to uint16

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | bytes to extract from |
| `byteIndex` | [`IntLike`](modules.md#intlike) | - |

#### Returns

[`uint64`](modules.md#uint64)

uint16 as uint64

#### Defined in

[types/global.d.ts:780](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L780)

___

### extract\_uint32

▸ **extract_uint32**(`data`, `byteIndex`): [`uint64`](modules.md#uint64)

Extracts 4 bytes from the given data starting at the given index and converts them to uint32

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | bytes to extract from |
| `byteIndex` | [`IntLike`](modules.md#intlike) | - |

#### Returns

[`uint64`](modules.md#uint64)

uint32 as uint64

#### Defined in

[types/global.d.ts:790](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L790)

___

### extract\_uint64

▸ **extract_uint64**(`data`, `byteIndex`): [`uint64`](modules.md#uint64)

Extracts 8 bytes from the given data starting at the given index and converts them to uint64

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | bytes to extract from |
| `byteIndex` | [`IntLike`](modules.md#intlike) | - |

#### Returns

[`uint64`](modules.md#uint64)

uint64

#### Defined in

[types/global.d.ts:800](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L800)

___

### getbit

▸ **getbit**(`data`, `bitIndex`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |
| `bitIndex` | [`IntLike`](modules.md#intlike) |

#### Returns

`boolean`

The value of the bit at the given index

#### Defined in

[types/global.d.ts:738](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L738)

___

### getbyte

▸ **getbyte**(`data`, `byteIndex`): [`uint64`](modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |
| `byteIndex` | [`IntLike`](modules.md#intlike) |

#### Returns

[`uint64`](modules.md#uint64)

The value of the byte at the given index

#### Defined in

[types/global.d.ts:750](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L750)

___

### hex

▸ **hex**(`input`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

[`bytes`](modules.md#bytes)

hex input decoded to bytes

#### Defined in

[types/global.d.ts:860](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L860)

___

### itob

▸ **itob**(`int`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type |
| :------ | :------ |
| `int` | [`IntLike`](modules.md#intlike) |

#### Returns

[`bytes`](modules.md#bytes)

[uint64](modules.md#uint64) converted to [bytes](modules.md#bytes)

#### Defined in

[types/global.d.ts:691](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L691)

___

### keccak256

▸ **keccak256**(`data`): [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

the keccak256 hash of the given data

#### Defined in

[types/global.d.ts:700](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L700)

___

### len

▸ **len**(`data`): [`uint64`](modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`uint64`](modules.md#uint64)

the length of the data

#### Defined in

[types/global.d.ts:719](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L719)

___

### log

▸ **log**(`content`): `void`

Logs data to the chain. Logs only persist if the app call is successful

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | [`BytesLike`](modules.md#byteslike) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:694](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L694)

___

### method

▸ **method**(`signature`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type |
| :------ | :------ |
| `signature` | `string` |

#### Returns

[`bytes`](modules.md#bytes)

#### Defined in

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L637)

___

### rawBytes

▸ **rawBytes**(`input`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `any` |

#### Returns

[`bytes`](modules.md#bytes)

#### Defined in

[types/global.d.ts:935](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L935)

___

### replace3

▸ **replace3**(`data`, `byteIndex`, `newData`): [`bytes`](modules.md#bytes)

Replace bytes in the given data starting at the given index

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | data containing the bytes that should be replaced |
| `byteIndex` | [`IntLike`](modules.md#intlike) | index of the first byte to replace |
| `newData` | [`BytesLike`](modules.md#byteslike) | bytes to replace with |

#### Returns

[`bytes`](modules.md#bytes)

updated data

#### Defined in

[types/global.d.ts:811](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L811)

___

### sendAppCall

▸ **sendAppCall**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.accounts?` | [`Address`](classes/Address.md)[] |
| `params.applicationArgs?` | [`bytes`](modules.md#bytes)[] |
| `params.applicationID?` | [`Application`](classes/Application.md) |
| `params.applications?` | [`Application`](classes/Application.md)[] |
| `params.approvalProgram?` | [`bytes`](modules.md#bytes) |
| `params.assets?` | [`Asset`](classes/Asset.md)[] |
| `params.clearStateProgram?` | [`bytes`](modules.md#bytes) |
| `params.extraProgramPages?` | [`uint64`](modules.md#uint64) |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.globalNumByteSlice?` | [`uint64`](modules.md#uint64) |
| `params.globalNumUint?` | [`uint64`](modules.md#uint64) |
| `params.localNumByteSlice?` | [`uint64`](modules.md#uint64) |
| `params.localNumUint?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.onCompletion?` | ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"`` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:641](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L641)

___

### sendAssetConfig

▸ **sendAssetConfig**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.configAsset` | [`Asset`](classes/Asset.md) |
| `params.configAssetClawback?` | [`Address`](classes/Address.md) |
| `params.configAssetFreeze?` | [`Address`](classes/Address.md) |
| `params.configAssetManager?` | [`Address`](classes/Address.md) |
| `params.configAssetReserve?` | [`Address`](classes/Address.md) |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:646](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L646)

___

### sendAssetCreation

▸ **sendAssetCreation**(`params`): [`Asset`](classes/Asset.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.configAssetClawback?` | [`Address`](classes/Address.md) |
| `params.configAssetDecimals?` | [`uint64`](modules.md#uint64) |
| `params.configAssetDefaultFrozen?` | [`uint64`](modules.md#uint64) |
| `params.configAssetFreeze?` | [`Address`](classes/Address.md) |
| `params.configAssetManager?` | [`Address`](classes/Address.md) |
| `params.configAssetMetadataHash?` | [`bytes`](modules.md#bytes) |
| `params.configAssetName?` | [`bytes`](modules.md#bytes) |
| `params.configAssetReserve?` | [`Address`](classes/Address.md) |
| `params.configAssetTotal` | [`uint64`](modules.md#uint64) |
| `params.configAssetURL?` | [`bytes`](modules.md#bytes) |
| `params.configAssetUnitName?` | [`bytes`](modules.md#bytes) |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |

#### Returns

[`Asset`](classes/Asset.md)

#### Defined in

[types/global.d.ts:643](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L643)

___

### sendAssetFreeze

▸ **sendAssetFreeze**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.freezeAsset` | [`Asset`](classes/Asset.md) |
| `params.freezeAssetAccount` | [`Address`](classes/Address.md) |
| `params.freezeAssetFrozen` | `boolean` |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:647](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L647)

___

### sendAssetTransfer

▸ **sendAssetTransfer**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.assetAmount` | [`uint64`](modules.md#uint64) |
| `params.assetCloseTo?` | [`Address`](classes/Address.md) |
| `params.assetReceiver` | [`Address`](classes/Address.md) |
| `params.assetSender?` | [`Address`](classes/Address.md) |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |
| `params.xferAsset` | [`Asset`](classes/Asset.md) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:642](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L642)

___

### sendMethodCall

▸ **sendMethodCall**<`ArgsType`, `ReturnType`\>(`params`): `ReturnType`

Sends ABI method call. The two type arguments in combination with the
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
| `params.accounts?` | [`Address`](classes/Address.md)[] | - |
| `params.applicationArgs?` | [`bytes`](modules.md#bytes)[] | - |
| `params.applicationID?` | [`Application`](classes/Application.md) | - |
| `params.applications?` | [`Application`](classes/Application.md)[] | - |
| `params.approvalProgram?` | [`bytes`](modules.md#bytes) | - |
| `params.assets?` | [`Asset`](classes/Asset.md)[] | - |
| `params.clearStateProgram?` | [`bytes`](modules.md#bytes) | - |
| `params.extraProgramPages?` | [`uint64`](modules.md#uint64) | - |
| `params.fee?` | [`uint64`](modules.md#uint64) | - |
| `params.globalNumByteSlice?` | [`uint64`](modules.md#uint64) | - |
| `params.globalNumUint?` | [`uint64`](modules.md#uint64) | - |
| `params.localNumByteSlice?` | [`uint64`](modules.md#uint64) | - |
| `params.localNumUint?` | [`uint64`](modules.md#uint64) | - |
| `params.methodArgs?` | `ArgsType` | ABI method arguments |
| `params.name` | `string` | Name of the ABI method |
| `params.note?` | `string` | - |
| `params.onCompletion?` | ``"NoOp"`` \| ``"OptIn"`` \| ``"CloseOut"`` \| ``"ClearState"`` \| ``"UpdateApplication"`` \| ``"DeleteApplication"`` \| ``"CreateApplication"`` | - |
| `params.rekeyTo?` | [`Address`](classes/Address.md) | - |
| `params.sender?` | [`Address`](classes/Address.md) | - |

#### Returns

`ReturnType`

The return value of the method call

**`Example`**

Calling a method and getting the return value
```ts
// call createNFT(string,string)uint64
const createdAsset = sendMethodCall<[string, string], Asset>({
    applicationID: factoryApp,
    name: 'createNFT',
    methodArgs: ['My NFT', 'MNFT'],
});
```

#### Defined in

[types/global.d.ts:682](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L682)

___

### sendOfflineKeyRegistration

▸ **sendOfflineKeyRegistration**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:645](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L645)

___

### sendOnlineKeyRegistration

▸ **sendOnlineKeyRegistration**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.selectionPK` | [`bytes`](modules.md#bytes) |
| `params.sender?` | [`Address`](classes/Address.md) |
| `params.stateProofPK` | [`bytes`](modules.md#bytes) |
| `params.voteFirst` | [`uint64`](modules.md#uint64) |
| `params.voteKeyDilution` | [`uint64`](modules.md#uint64) |
| `params.voteLast` | [`uint64`](modules.md#uint64) |
| `params.votePK` | [`bytes`](modules.md#bytes) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:644](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L644)

___

### sendPayment

▸ **sendPayment**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.amount` | [`uint64`](modules.md#uint64) |
| `params.closeRemainderTo?` | [`Address`](classes/Address.md) |
| `params.fee?` | [`uint64`](modules.md#uint64) |
| `params.note?` | `string` |
| `params.receiver` | [`Address`](classes/Address.md) |
| `params.rekeyTo?` | [`Address`](classes/Address.md) |
| `params.sender?` | [`Address`](classes/Address.md) |

#### Returns

`void`

#### Defined in

[types/global.d.ts:640](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L640)

___

### setbit

▸ **setbit**(`data`, `bitIndex`, `value`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | The input data to update |
| `bitIndex` | [`IntLike`](modules.md#intlike) | The index of the bit to update |
| `value` | [`IntLike`](modules.md#intlike) | The value to set the bit to |

#### Returns

[`bytes`](modules.md#bytes)

The updated data

#### Defined in

[types/global.d.ts:747](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L747)

___

### setbyte

▸ **setbyte**(`data`, `byteIndex`, `value`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | The input data to update |
| `byteIndex` | [`IntLike`](modules.md#intlike) | The index of the byte to update |
| `value` | [`IntLike`](modules.md#intlike) | The value to set the byte to |

#### Returns

[`bytes`](modules.md#bytes)

The updated data

#### Defined in

[types/global.d.ts:759](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L759)

___

### sha256

▸ **sha256**(`data`): [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

the sha256 hash of the given data

#### Defined in

[types/global.d.ts:697](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L697)

___

### sha3\_256

▸ **sha3_256**(`data`): [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

sha3_256 hash of the given data

#### Defined in

[types/global.d.ts:840](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L840)

___

### sha512\_256

▸ **sha512_256**(`data`): [`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) |

#### Returns

[`StaticArray`](modules.md#staticarray)<[`byte`](modules.md#byte), ``32``\>

the sha512_256 hash of the given data

#### Defined in

[types/global.d.ts:703](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L703)

___

### sqrt

▸ **sqrt**(`n`): [`uint64`](modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | [`IntLike`](modules.md#intlike) |

#### Returns

[`uint64`](modules.md#uint64)

square root of the given uint64

#### Defined in

[types/global.d.ts:825](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L825)

___

### substring3

▸ **substring3**(`data`, `start`, `end`): [`bytes`](modules.md#bytes)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`BytesLike`](modules.md#byteslike) | The input data from which bytes are extracted |
| `start` | [`IntLike`](modules.md#intlike) | The start index of the bytes to extract |
| `end` | [`IntLike`](modules.md#intlike) | The end index of the bytes to extract (not inclusive) |

#### Returns

[`bytes`](modules.md#bytes)

Extracted bytes

#### Defined in

[types/global.d.ts:735](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L735)

___

### templateVar

▸ **templateVar**<`TmplType`\>(`name`): `TmplType`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TmplType` | extends `number` \| [`bytes`](modules.md#bytes) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`TmplType`

#### Defined in

[types/global.d.ts:931](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L931)

___

### verifyTxn

▸ **verifyTxn**(`txn`, `params`): `any`

Verifies the fields of a transaction against the given parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txn` | [`AssetTransferParams`](interfaces/AssetTransferParams.md) \| [`AssetFreezeParams`](interfaces/AssetFreezeParams.md) \| [`ThisTxnParams`](modules.md#thistxnparams) \| `Required`<[`PaymentParams`](interfaces/PaymentParams.md)\> \| [`AppCallTxn`](modules.md#appcalltxn) \| `Required`<[`KeyRegParams`](interfaces/KeyRegParams.md)\> \| `Required`<[`AssetConfigParams`](interfaces/AssetConfigParams.md)\> \| [`Txn`](modules.md#txn) | the transaction to verify |
| `params` | [`TxnVerificationFields`](modules.md#txnverificationfields) | the transaction fields to verify in the given transaction |

#### Returns

`any`

#### Defined in

[types/global.d.ts:871](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L871)

___

### wideRatio

▸ **wideRatio**(`numeratorFactors`, `denominatorFactors`): [`uint64`](modules.md#uint64)

Use this method if all inputs to the expression are uint64s,
the output fits in a uint64, and all intermediate values fit in a uint128.
Otherwise uintN division should be used.

#### Parameters

| Name | Type |
| :------ | :------ |
| `numeratorFactors` | [`uint64`](modules.md#uint64)[] |
| `denominatorFactors` | [`uint64`](modules.md#uint64)[] |

#### Returns

[`uint64`](modules.md#uint64)

product of numerators divided by product of denominator

#### Defined in

[types/global.d.ts:857](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L857)
