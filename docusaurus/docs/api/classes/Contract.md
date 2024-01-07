---
id: "Contract"
title: "Class: Contract"
sidebar_label: "Contract"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Contract**(): [`Contract`](Contract.md)

#### Returns

[`Contract`](Contract.md)

## Properties

### app

• **app**: [`Application`](Application.md)

#### Defined in

[src/lib/contract.ts:77](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L77)

___

### itxn

• **itxn**: `ItxnParams`

#### Defined in

[src/lib/contract.ts:71](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L71)

___

### pendingGroup

• **pendingGroup**: [`PendingGroup`](PendingGroup.md)

#### Defined in

[src/lib/contract.ts:79](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L79)

___

### programVersion

• **programVersion**: `number` = `9`

The program version to use in the generated TEAL. This is the number used in the "#pragma version" directive

#### Defined in

[src/lib/contract.ts:69](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L69)

___

### txn

• **txn**: [`ThisTxnParams`](../modules.md#thistxnparams)

#### Defined in

[src/lib/contract.ts:73](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L73)

___

### txnGroup

• **txnGroup**: [`Txn`](../modules.md#txn)[]

#### Defined in

[src/lib/contract.ts:75](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L75)

___

### approvalProgram

▪ `Static` **approvalProgram**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/contract.ts:53](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L53)

___

### clearProgram

▪ `Static` **clearProgram**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/contract.ts:55](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L55)

___

### extend

▪ `Static` **extend**: \<T\>(...`types`: `T`) => `Polytype.ClusteredConstructor`\<`T`\>

Create a contract class that inherits from the given contracts. Inheritance is in order of arguments.

#### Type declaration

▸ \<`T`\>(`...types`): `Polytype.ClusteredConstructor`\<`T`\>

Create a contract class that inherits from the given contracts. Inheritance is in order of arguments.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`SuperConstructor`, ...SuperConstructor[]] |

##### Parameters

| Name | Type |
| :------ | :------ |
| `...types` | `T` |

##### Returns

`Polytype.ClusteredConstructor`\<`T`\>

#### Defined in

[src/lib/contract.ts:51](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L51)

___

### schema

▪ `Static` **schema**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `global` | \{ `numByteSlice`: `number` ; `numUint`: `number`  } |
| `global.numByteSlice` | `number` |
| `global.numUint` | `number` |
| `local` | \{ `numByteSlice`: `number` ; `numUint`: `number`  } |
| `local.numByteSlice` | `number` |
| `local.numUint` | `number` |

#### Defined in

[src/lib/contract.ts:57](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L57)

## Methods

### clearState

▸ **clearState**(): `void`

The method called when an account clears their local state. The default ClearState
method does nothing. ClearState will always allow a user to delete their local state,
reagrdless of logic.

#### Returns

`void`

#### Defined in

[src/lib/contract.ts:129](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L129)

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

[src/lib/contract.ts:120](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L120)

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

[src/lib/contract.ts:86](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L86)

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

[src/lib/contract.ts:104](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L104)

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

[src/lib/contract.ts:112](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L112)

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

[src/lib/contract.ts:96](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/contract.ts#L96)
