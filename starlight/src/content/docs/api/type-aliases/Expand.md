---
editUrl: false
next: false
prev: false
title: "Expand"
---

> **Expand**\<`T`\>: `T` extends (...`args`) => infer R ? (...`args`) => [`Expand`](Expand.md)\<`R`\> : `T` extends infer O ? `{ [K in keyof O]: O[K] }` : `never`

## Type parameters

• **T**

## Source

[types/global.d.ts:6](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L6)
