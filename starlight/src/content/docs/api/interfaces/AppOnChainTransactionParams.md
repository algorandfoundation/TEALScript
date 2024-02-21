---
editUrl: false
next: false
prev: false
title: "AppOnChainTransactionParams"
---

## Extends

- [`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md)

## Properties

### applicationID

> **applicationID**: [`Application`](../classes/Application.md)

The application that was called

#### Source

[types/global.d.ts:657](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L657)

***

### createdApplicationID

> **createdApplicationID**: [`Application`](../classes/Application.md)

The application created by this application call

#### Source

[types/global.d.ts:653](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L653)

***

### createdAssetID

> **createdAssetID**: [`Asset`](../classes/Asset.md)

The asset created by this application call

#### Source

[types/global.d.ts:651](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L651)

***

### fee

> **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md).[`fee`](CommonOnChainTransactionParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L633)

***

### groupIndex

> **groupIndex**: [`uint64`](../type-aliases/uint64.md)

The index of this transaction in its group

#### Inherited from

[`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md).[`groupIndex`](CommonOnChainTransactionParams.md#groupindex)

#### Source

[types/global.d.ts:644](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L644)

***

### lastLog

> **lastLog**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The last log emitted by this application call

#### Source

[types/global.d.ts:655](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L655)

***

### loadScratch

> **loadScratch**: (`slot`) => `unknown`

Load the value in the given scratch slot. **MUST** use an `as` expression to specify the value type.

#### Parameters

• **slot**: [`uint64`](../type-aliases/uint64.md)

#### Returns

`unknown`

#### Example

```ts
someAppCall.loadScratch(0) as uint64;
```

#### Source

[types/global.d.ts:680](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L680)

***

### note

> **note**: `string`

The note field for this transaction

#### Inherited from

[`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md).[`note`](CommonOnChainTransactionParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L639)

***

### numAccounts

> **numAccounts**: [`uint64`](../type-aliases/uint64.md)

The number of accounts in the foreign accounts array

#### Source

[types/global.d.ts:661](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L661)

***

### numAppArgs

> **numAppArgs**: [`uint64`](../type-aliases/uint64.md)

The number of application arguments

#### Source

[types/global.d.ts:659](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L659)

***

### numApplicatons

> **numApplicatons**: [`uint64`](../type-aliases/uint64.md)

The number of applications in the foreign applications array

#### Source

[types/global.d.ts:665](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L665)

***

### numApprovalProgrammPages

> **numApprovalProgrammPages**: [`uint64`](../type-aliases/uint64.md)

The number of pages used by the approval program

#### Source

[types/global.d.ts:669](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L669)

***

### numAssets

> **numAssets**: [`uint64`](../type-aliases/uint64.md)

The number of assets in the foreign assets array

#### Source

[types/global.d.ts:663](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L663)

***

### numClearStateProgramPages

> **numClearStateProgramPages**: [`uint64`](../type-aliases/uint64.md)

The number of pages used by the clear state program

#### Source

[types/global.d.ts:671](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L671)

***

### numLogs

> **numLogs**: [`uint64`](../type-aliases/uint64.md)

The number of logs emitted by this application call

#### Source

[types/global.d.ts:667](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L667)

***

### rekeyTo

> **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md).[`rekeyTo`](CommonOnChainTransactionParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L637)

***

### sender

> **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md).[`sender`](CommonOnChainTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)

***

### txID

> **txID**: `string`

The transaction ID for this transaction

#### Inherited from

[`CommonOnChainTransactionParams`](CommonOnChainTransactionParams.md).[`txID`](CommonOnChainTransactionParams.md#txid)

#### Source

[types/global.d.ts:646](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L646)
