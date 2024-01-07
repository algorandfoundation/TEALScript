---
id: "AppOnChainTransactionParams"
title: "Interface: AppOnChainTransactionParams"
sidebar_label: "AppOnChainTransactionParams"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md)

  ↳ **`AppOnChainTransactionParams`**

## Properties

### applicationID

• **applicationID**: [`Application`](../classes/Application.md)

#### Defined in

[types/global.d.ts:527](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L527)

___

### createdApplicationID

• **createdApplicationID**: [`Application`](../classes/Application.md)

#### Defined in

[types/global.d.ts:525](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L525)

___

### createdAssetID

• **createdAssetID**: [`Asset`](../classes/Asset.md)

#### Defined in

[types/global.d.ts:524](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L524)

___

### fee

• **fee**: [`uint64`](../modules.md#uint64)

#### Inherited from

[CommonOnChainTransactionParams](CommonOnChainTransactionParams.md).[fee](CommonOnChainTransactionParams.md#fee)

#### Defined in

[types/global.d.ts:512](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L512)

___

### groupIndex

• **groupIndex**: [`uint64`](../modules.md#uint64)

#### Inherited from

[CommonOnChainTransactionParams](CommonOnChainTransactionParams.md).[groupIndex](CommonOnChainTransactionParams.md#groupindex)

#### Defined in

[types/global.d.ts:519](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L519)

___

### lastLog

• **lastLog**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:526](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L526)

___

### loadScratch

• **loadScratch**: (`slot`: [`uint64`](../modules.md#uint64)) => `unknown`

#### Type declaration

▸ (`slot`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `slot` | [`uint64`](../modules.md#uint64) |

##### Returns

`unknown`

#### Defined in

[types/global.d.ts:535](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L535)

___

### note

• **note**: `string`

#### Inherited from

[CommonOnChainTransactionParams](CommonOnChainTransactionParams.md).[note](CommonOnChainTransactionParams.md#note)

#### Defined in

[types/global.d.ts:515](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L515)

___

### numAccounts

• **numAccounts**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:529](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L529)

___

### numAppArgs

• **numAppArgs**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:528](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L528)

___

### numApplicatons

• **numApplicatons**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:531](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L531)

___

### numApprovalProgrammPages

• **numApprovalProgrammPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:533](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L533)

___

### numAssets

• **numAssets**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:530](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L530)

___

### numClearStateProgramPages

• **numClearStateProgramPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:534](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L534)

___

### numLogs

• **numLogs**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:532](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L532)

___

### rekeyTo

• **rekeyTo**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonOnChainTransactionParams](CommonOnChainTransactionParams.md).[rekeyTo](CommonOnChainTransactionParams.md#rekeyto)

#### Defined in

[types/global.d.ts:514](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L514)

___

### sender

• **sender**: [`Address`](../classes/Address.md)

#### Inherited from

[CommonOnChainTransactionParams](CommonOnChainTransactionParams.md).[sender](CommonOnChainTransactionParams.md#sender)

#### Defined in

[types/global.d.ts:513](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L513)

___

### txID

• **txID**: `string`

#### Inherited from

[CommonOnChainTransactionParams](CommonOnChainTransactionParams.md).[txID](CommonOnChainTransactionParams.md#txid)

#### Defined in

[types/global.d.ts:520](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L520)
