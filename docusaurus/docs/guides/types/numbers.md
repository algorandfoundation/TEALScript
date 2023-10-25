---
title: Numbers
---

The native numeric type in the AVM is unsigned 64-bit integers, `uint64`. Thus any math operations using `uint64` will be more efficient than any alternatives. As such, you should always use `uint64` when possible. You can, however, use any of the number types defined in ARC-0004.

It should be noted that at the TypeScript level, all numbers are aliases to the standard `number` class. This is to ensure all arithmetic operators function on all numberic types as expected since they cannot be overwritten in TypeScript. As such, any number-related type errors might not show in the IDE and will only throw an error during compilation.

## Integers

You can define specific-width unsigned integers with the `uint<N>` generic type. This type takes one type argument, which is the bit width. The bit width must be divisible by 8. 

**Note:** In TEALScript `uint64`, `number`, and `uint<64>` are all the same type.

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

## Type casting

You can cast types of one number to another (but only `uint` -> `uint` or `ufixed` -> `ufixed`). The compiler will automatically pad smaller values to bigger ones where applicable (such as return values), but will throw an runtime error if there is a value overflow when going from a bigger width to a smaller width. 

### Examples

#### Correct: Implicit Padding
```ts
foo(): uint16 {
    const n: uint8 = 1
    return n // Compiler will convert n (0x01) to uint16 (0x0001)
}
```

#### Correct: Explicit Bit Reduction
```ts
foo(): uint8 {
    const n: uint16 = 1
    return n // Compiler will convert n (0x0001) to uint8 (0x01). Runtime error if there is an overflow.
```

## Math

You can use standard math operators (`+`, `-`, `/`, `*`, `%`) on any type of numner as long as both operands are the same. Exponents (`**`) work as long as the power is 2^64 or less. 

### Overflows

During runtime, there will be an overflow check upon storage of values, returning values, or type casting. This means there is no type checking of intermediate values of math operations, with the exception of uint64 math. This means the following example will NOT throw an error, even though the intermediate value of `a + b` is larger than the max `uint8` value. 

```ts
const a: uint8 = 255
const b: uint8 = 1
const c = a + b - b
```

The only exception to intermediate arithmetic overflows is if the value is larger than 2^512 because this is the largest value supported by the AVM.

### Underflows

Any operation that results in a value less than 0 will cause a panic in the AVM.