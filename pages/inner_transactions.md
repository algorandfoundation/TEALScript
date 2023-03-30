There are multiple methods for sending inner transcations. There is one method for each transcation type ({@link sendPayment}, {@link sendAssetTransfer}, {@link sendAppCall}) and a couple of additional methods for specific kinds of transactions which are documented below.

## {@link sendMethodCall}

`sendMethodCall<ArgsType, ReturnType>` expects two type arguments. `ArgsType` is a tuple type containing the types of the input parameters of the method and `ReturnType` is the return type of the ABI method. These type arguments, in combination with the `name` argument, are used to form the the method signature. If `sendMethodCall` is being used to intialize a variable or parameter, it will be the ABI return value.

### Example
```ts
// call createNFT(string,string)uint64
const createdAsset = sendMethodCall<[string, string], Asset>({
    applicationID: factoryApp,
    name: 'createNFT',
    methodArgs: ['My NFT', 'MNFT'],
    onCompletion: 'NoOp',
    fee: 0,
});
```

## Inner Transaction Fields

The fields of the most recent inner transaction can be read via {@link Contract.itxn | this.itxn}