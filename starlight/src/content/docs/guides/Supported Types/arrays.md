---
title: Arrays, Tuples, and Objects
---

TEALScript supports various forms of arrays and tuples. In general, it is always recommended to use **static** types in arrays whenever possible and avoid booleans. Dynamic types and booleans are much more expensive to use and have some limitations listed below. 

## Pass by Reference
All arrays and objects are passed by reference even if in contract state, much like TypeScript. TEALScript, however, will not let a function mutate an array that was passed as an argument.

If you wish to pass by value you can use `clone`.

```ts
const x: uint64[] = [1,2,3];
const y = x;
y[0] = 4

log(y) // [4, 2, 3]
log(x) // [4, 2, 3]

const z = clone(x)
z[1] = 5

log(x) // [4, 2, 3] note x has NOT changed
log(z) // [4, 5, 3]
```

## Instantiation

When instantiating an array or object, a type **MUST** be defined. For example, `const x: uint64[] = [1, 2, 3]`. If you omit the type, the compiler will throw an error `const x = [1, 2, 3] // ERROR`

## Static Arrays

The most efficient and capable type of arrays are static arrays. To define a static array type in TEALScript you need to use the `StaticArray` generic type. For example, `StaticArray<uint64, 10>` for an array of 10 unsigned 64-bit integers. It should be noted that putting the length in a bracket (ie. `uint64[10]`) is **NOT** valid TypeScript syntax thus not officially supported by TEALScript.

### Partial Definition

If you have a static array but only want to initialize some of the initial values, you can it instantiate with an array less than the defined length. The remaning values will be zero bytes. For example, the following instantiations create the same underlying byte array

```ts
const x: <StaticArray, 3> = [1]
const y: <StaticArray, 3> = [1, 0, 0]
```

### forEach iteration

The most efficient way to iterate over an array is to use `.forEach`. This is currently only supported on static arrays. `.forEach` also works on arrays larger than 4kb stored in boxes. 

```ts
  staticForEach(): uint64 {
    const a: StaticArray<uint64, 3> = [1, 2, 3];
    let sum = 0;

    a.forEach((v) => {
      sum += v;
    });
    return sum; // 6
  }
```


It should be noted that the second argument (current index) is not currently supported. The iterator function must also be explicitly defined as an arrow function (rather than passing in another function). Both of these features are being considered for future releases.

### Supported Methods

The following array methods are supported on static arrays (note the limitations on `forEach` above)

* [length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
* [forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)

## Dynamic Arrays

Dynamic arrays are supported in TEALScript but anything beyond dynamic arrays of static types is very inefficient. For example, `uint64[]` is fairly efficient but `uint64[][]` is much less efficient. 

### Tecnical Explanation

Under the hood, TEALScript will chop off the length prefix of dynamic arrays during runtime. This means `uint64[]` is just a bunch of 8-byte slices concatenated together. This makes all operations, whether its reading or writing, much more simple. Nested dynamic types are encoded as dynamic tuples, this requires much more opcodes to read/write the tuple head and tail values. 

### Supported Methods

Dynamic arrays in TEALScript support the following methods and they function just as they do in TypeScript. It should be noted that `splice` is rather heavy in terms of opcode cost so it should be used sparringly.

* [pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
* [push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
* [splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
* [length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length)

## Objects

Object can be defined much like in TypeScript. The same efficiencies of static vs dynamic types also applies to objects. 

Currently no `Object` methods are supported in TEALScript.

### Technical Explanation 

Under the hood, TEALScript objects are just tuples. For example `[uint64, uint8]` is the same byteslice as `{ foo: uint64, bar: uint8 }`. The order of elements in the tuple depends on the order they are defined in the type defintion. For example, the following definitions result in the same byteslice.

```ts
type MyType = { foo: uint64, bar: uint8 }

...

const x: MyType = { foo: 1, bar: 2}
const y: MyType = { bar: 2, foo: 1 }
```
