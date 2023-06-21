The native numeric type in the AVM is unsigned 64-bit integers, {@link uint64}. Thus any math operations using {@link uint64} will be more efficient than any alternatives. As such, you should always use {@link uint64} when possible. You can, however, use any of the number types defined in ARC-0004.

It should be noted that at the TypeScript level, all numbers are aliases to the standard `number` class. This is to ensure all arithmetic operators function on all numberic types as expected since they cannot be overwritten in TypeScript. As such, any number-related type errors might not show in the IDE and will only throw an error during compilation.

## Integers

You can define specific-width unsigned integers with the {@link uint} generic type. This type takes one type argument, which is the bit width. The bit width must be divisible by 8. 

**Note:** In TEALScript `uint64`, `number`, and `uint<64>` are all the same type.

### Examples

#### Correct: Unsigned 8-bit integer
```ts
const n: uint<8> = 1
```

#### Incorrect: Missing type argument
```ts
const n: uint8 = 1 // ERROR: should be uint<8>
```

## Unsigned Fixed-Point Decimals

To represent decimals, use the {@link ufixed} generic type. The first type argument is the bit width, which must be divisible by 8. The second argument is the number of decimals places, which must be less than 160. 

### Examples

#### Correct: Unsigned 64-bit With Two Decimals
```ts
const n: ufixed<64, 2> = 1.23
```

#### Incorrect: Missing type argument
```ts
const n: ufixed64x2 = 1.23 // ERROR: should be uint<8>
```

#### Incorrect: Not Precise Enough
```ts
const n: ufixed<64, 2> = 1.234 // ERROR: Precision of 2 decimals places, but 3 are given
```

## Type casting

You can cast types of one number to another (but only `uint` -> `uint` or `ufixed` -> `ufixed`). The compiler will automatically pad smaller values to bigger ones where applicable (such as return values), but will throw an error if the bit width is being reduced without explicit type casting.

### Examples

#### Correct: Implicit Padding
```ts
foo(): uint16 {
    const n: uint8 = 1
    return n // Compiler will convert b (0x01) to uint16 (0x0001)
}
```

#### Correct: Explicit Bit Reduction
```ts
foo(): uint8 {
    const n: uint16 = 1
    return n as uint8 // Compiler will convert b (0x0001) to uint8 (0x01)
}
```

#### Incorrect: Implicit Bit Reduction
```ts
foo(): uint8 {
    const n: uint16 = 1
    return n // ERROR: won't implictly convert uint16 to uint8
}
```

## Math

You can use standard math operators (`+`, `-`, `/`, `*`) on any type of numner as long as both operands are the same. 

### Overflows

Currently, there is no overflow errors on math operations, unless the value exceeds 4kb. Values will be truncated to fit in the types respective width. For example:

```ts
const a: uint8 = 255
const b: uint8 = 255
const c = a + b // 0xFF + 0xFF ==raw value==> 0x01FE ==truncated==> 0xFE
```

### Underflows

Any operation that results in a value less than 0 will cause a panic in the AVM.