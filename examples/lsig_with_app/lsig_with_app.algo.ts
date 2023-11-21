import { Contract, LogicSig } from '../../src/lib/index';

/**
 * This lsig approves transactions that opt in to an asset AND
 * call the verifyCreator method in our app
 */
// eslint-disable-next-line no-unused-vars
class OptInLsig extends LogicSig {
  /** Verify this is an opt in transaction */
  logic(): void {
    /** Verify that the transaction this logic signature is approving is an ASA opt-in */
    verifyTxn(this.txn, {
      typeEnum: TransactionType.AssetTransfer,
      assetAmount: 0,
      assetReceiver: this.txn.sender,
      fee: 0,
      rekeyTo: globals.zeroAddress,
      assetCloseTo: globals.zeroAddress,
    });

    const appCall = this.txnGroup[this.txn.groupIndex + 1];

    // Use assert instead of verifyTxn because applicationArgs array is not yet supported in verifyTxn
    assert(appCall.applicationID === Application.fromID(templateVar<uint64>('APP_ID')));
    assert(appCall.applicationArgs[0] === method('verifyCreator(axfer,asset)void'));
  }
}

// eslint-disable-next-line no-unused-vars
class CreatorVerifier extends Contract {
  /** Mapping of [user,creator] to determine which creators the user will allow opt-ins from */
  allowedCreators = BoxMap<[Address, Address], boolean>();

  /** Allow anyone to use the lsig to opt in the txn sender into an asset created by the creator */
  allowOptInsFrom(creator: Address): void {
    this.allowedCreators([this.txn.sender, creator]).value = true;
  }

  /** Disable opt-ins for ASAs from the given creator */
  disableOptInsFrom(creator: Address): void {
    this.allowedCreators([this.txn.sender, creator]).value = false;
  }

  // eslint-disable-next-line no-unused-vars
  verifyCreator(optIn: AssetTransferTxn, _asaReference: Asset): void {
    /** assert that the user has allowed optIns from the ASA creator */
    assert(this.allowedCreators([optIn.sender, optIn.xferAsset.creator]).value);
  }
}
