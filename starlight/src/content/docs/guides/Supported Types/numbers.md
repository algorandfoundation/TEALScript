---
title: Numbers
---

The native numeric type in the AVM is unsigned 64-bit integers, `uint64`. Thus any math operations using `uint64` will be more efficient than any alternatives. As such, you should always use `uint64` when possible. You can, however, use any of the number types defined in ARC-0004.

It should be noted that at the TypeScript level, all numbers are aliases to the standard `number` class. This is to ensure all arithmetic operators function on all numeric types as expected since they cannot be overwritten in TypeScript. As such, any number-related type errors might not show in the IDE and will only throw an error during compilation.

## Integers

You can define specific-width unsigned integers with the `uint<N>` generic type. This type takes one type argument, which is the bit width. The bit width must be divisible by 8.

### Examples

#### Correct: Unsigned 64-bit integer

```ts
const n = 1
```

#### Correct: Unsigned 8-bit integer
```ts
const n: uint<8> = 1
```

## Unsigned Fixed-Point Decimals

To represent decimals, use the `ufixed<N,M>` generic type. The first type argument is the bit width, which must be divisible by 8. The second argument is the number of decimals places, which must be less than 160. 

### Examples

#### Correct: Unsigned 64-bit With Two Decimals
```ts
const n: ufixed<64, 2> = 1.23
```

#### Incorrect: Missing type
```ts
const n = 1.23 // ERROR: Missing type
```

#### Incorrect: Not Precise Enough
```ts
const n: ufixed<64, 2> = 1.234 // ERROR: Precision of 2 decimals places, but 3 are given
```

## Math

See [math](../math.md)