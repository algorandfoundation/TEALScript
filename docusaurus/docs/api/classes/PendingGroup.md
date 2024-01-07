---
id: "PendingGroup"
title: "Class: PendingGroup"
sidebar_label: "PendingGroup"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new PendingGroup**(): [`PendingGroup`](PendingGroup.md)

#### Returns

[`PendingGroup`](PendingGroup.md)

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
| `params.approvalProgram?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } |
| `params.assets?` | [`Asset`](Asset.md)[] |
| `params.clearStateProgram?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } |
| `params.extraProgramPages?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.globalNumByteSlice?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.globalNumUint?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.localNumByteSlice?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.localNumUint?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.note?` | `string` |
| `params.onCompletion?` | [`NoOp`](../enums/OnCompletion.md#noop) \| [`OptIn`](../enums/OnCompletion.md#optin) \| [`CloseOut`](../enums/OnCompletion.md#closeout) \| [`ClearState`](../enums/OnCompletion.md#clearstate) \| [`UpdateApplication`](../enums/OnCompletion.md#updateapplication) \| [`DeleteApplication`](../enums/OnCompletion.md#deleteapplication) |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:24](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L24)

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
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:34](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L34)

___

### addAssetCreation

▸ **addAssetCreation**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.configAssetClawback?` | [`Address`](Address.md) |
| `params.configAssetDecimals?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.configAssetDefaultFrozen?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.configAssetFreeze?` | [`Address`](Address.md) |
| `params.configAssetManager?` | [`Address`](Address.md) |
| `params.configAssetMetadataHash?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } |
| `params.configAssetName?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } |
| `params.configAssetReserve?` | [`Address`](Address.md) |
| `params.configAssetTotal` | [`uint64`](../modules.md#uint64) |
| `params.configAssetURL?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } |
| `params.configAssetUnitName?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:28](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L28)

___

### addAssetFreeze

▸ **addAssetFreeze**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.freezeAsset` | [`Asset`](Asset.md) |
| `params.freezeAssetAccount` | [`Address`](Address.md) |
| `params.freezeAssetFrozen` | `boolean` |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:36](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L36)

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
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |
| `params.xferAsset` | [`Asset`](Asset.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:26](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L26)

___

### addMethodCall

▸ **addMethodCall**\<`ArgsType`, `ReturnType`\>(`params`): `void`

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
| `params.approvalProgram?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } | - |
| `params.assets?` | [`Asset`](Asset.md)[] | - |
| `params.clearStateProgram?` | `string` \| `string` & \{ `__brand?`: ``"bytes"``  } | - |
| `params.extraProgramPages?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } | - |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } | - |
| `params.globalNumByteSlice?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } | - |
| `params.globalNumUint?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } | - |
| `params.localNumByteSlice?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } | - |
| `params.localNumUint?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } | - |
| `params.methodArgs?` | `ArgsType` | ABI method arguments |
| `params.name` | `string` | Name of the ABI method |
| `params.note?` | `string` | - |
| `params.onCompletion?` | [`NoOp`](../enums/OnCompletion.md#noop) \| [`OptIn`](../enums/OnCompletion.md#optin) \| [`CloseOut`](../enums/OnCompletion.md#closeout) \| [`ClearState`](../enums/OnCompletion.md#clearstate) \| [`UpdateApplication`](../enums/OnCompletion.md#updateapplication) \| [`DeleteApplication`](../enums/OnCompletion.md#deleteapplication) | - |
| `params.rekeyTo?` | [`Address`](Address.md) | - |
| `params.sender?` | [`Address`](Address.md) | - |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:20](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L20)

___

### addOfflineKeyRegistration

▸ **addOfflineKeyRegistration**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.note?` | `string` |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:32](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L32)

___

### addOnlineKeyRegistration

▸ **addOnlineKeyRegistration**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
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

[src/lib/contract.ts:30](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L30)

___

### addPayment

▸ **addPayment**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.amount?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.closeRemainderTo?` | [`Address`](Address.md) |
| `params.fee?` | `number` \| `number` & \{ `__brand?`: ``"uint64"``  } |
| `params.note?` | `string` |
| `params.receiver?` | [`Address`](Address.md) |
| `params.rekeyTo?` | [`Address`](Address.md) |
| `params.sender?` | [`Address`](Address.md) |

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:22](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L22)

___

### submit

▸ **submit**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:38](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L38)
