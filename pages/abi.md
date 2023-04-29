## Array Assignment

Whenever you are assigning an array or tuple, the type hint must be provided.

## Dynamic Arrays

Dynamic arrays are defined just like arrays in TypeScript. Dynamic arrays support `push`, `pop`, and `splice` and they function in the same way as the native JavaScript functions.

### Example

```ts
const uint8Array: uint8[] = [1, 2, 3, 4, 5]
```

## Static Arrays
Static arrays can be defined in two ways and do not support any methods.

### Examples

These two examples are functionally the same

#### StaticArray
```ts
const staticUint8Array: StaticArray<uint8, 3> = [1, 2, 3]
```

#### Type with argument
```ts
const staticUint8Array: uint8<3> = [1, 2, 3]
```

## Tuples

Tuples are arrays with multiple types. TEALScript does not support nested dynamic tuples (yet).

### Example

```ts
const tuple: [uint8, uint64<3>, string] = [1, [2, 3, 4], 'Hello World!']
```

## Objects

Objects are essentially tuples, but they are accessed via keys rather than numbers.


### Example
```ts
const obj: { num: uint8, threeNumbers: uint64<3>, message: string } = {
    num: 1, 
    threeNumbers: [2, 3, 4], 
    message: 'Hello World!'
}
```

## Custom Types
TypeScript types can be used to create custom object types. All the same rules for objects/tuples applies.

```ts
type MyType = { num: uint8, threeNumbers: uint8<3>, message: string }

class MyContract extends Contract {
  foo(n: uint8, name: string): uint8 {
    const obj: MyType = {
        num: n,
        message: 'Hello, ' + name,
        threeNumbers: [n, n + 1, n + 2]
    }

    return obj.threeNumbers[2]
  }
}
```
