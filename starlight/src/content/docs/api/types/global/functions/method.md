---
editUrl: false
next: false
prev: false
title: "method"
---

> **method**(`signature`): [`bytes`](../type-aliases/bytes.md)

Given an ABI method signature, return the method selector

## Parameters

• **signature**: `string`

The method signature

## Returns

[`bytes`](../type-aliases/bytes.md)

## Example

```ts
verifyAppCallTxn(
someAppCall,
{ applicationArgs: { 0: method('add(uint64,uint64)uint64') }
})
```

## Source

[types/global.d.ts:843](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L843)
