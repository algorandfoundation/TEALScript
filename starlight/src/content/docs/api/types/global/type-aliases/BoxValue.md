---
editUrl: false
next: false
prev: false
title: "BoxValue"
---

> **BoxValue**\<`ValueType`\>: `Object`

A value saved in box storage

## Type parameters

• **ValueType**

## Type declaration

### delete

> **delete**: () => `void`

#### Returns

`void`

### exists

> **exists**: `boolean`

### size

> **size**: [`uint64`](uint64.md)

### value

> **value**: `ValueType`

### create()

#### Parameters

• **size?**: [`uint64`](uint64.md)

#### Returns

`void`

### extract()

#### Parameters

• **offset**: [`uint64`](uint64.md)

• **length**: [`uint64`](uint64.md)

#### Returns

[`Brand`](Brand.md)\<`string`, `"bytes"`\>

### replace()

#### Parameters

• **offset**: [`uint64`](uint64.md)

• **value**: [`Brand`](Brand.md)\<`string`, `"bytes"`\>

#### Returns

`void`

### resize()

Change the size of the box dding zero bytes to end or removing bytes from the end, as needed.
Throws error if the box does not exist or the size is larger than 32,768.

#### Parameters

• **size**: [`uint64`](uint64.md)

The new size of the box

#### Returns

`void`

### splice()

Remove bytes from the box starting at the given offset and replace them with the given data.

#### Parameters

• **offset**: [`uint64`](uint64.md)

• **length**: [`uint64`](uint64.md)

• **data**: [`Brand`](Brand.md)\<`string`, `"bytes"`\>

#### Returns

`void`

## Source

[types/global.d.ts:562](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L562)
