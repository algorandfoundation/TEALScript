import { Contract, LogicSig } from '../../src/lib/index';

/**
 * This lsig approves transactions that opt in to an asset AND
 * call the verifyCreator method in our app
 */
// eslint-disable-next-line no-unused-vars
class OptInLsig extends LogicSig {
  APP_ID = TemplateVar<AppID>();

  /** Verify this is an opt in transaction */
  logic(): void {
    /** Verify that the transaction this logic signature is approving is an ASA opt-in */
    verifyAssetTransferTxn(this.txn, {
      assetAmount: 0,
      assetReceiver: this.txn.sender,
      // It's very important to set fee to 0 for delegated logic signatures
      // Otherwise the fee can be used to drain the signer's account
      fee: 0,
      // Also very important to check that the rekey is set to zero address
      rekeyTo: globals.zeroAddress,
      // Finally we must ensure that this is not a close transaction, which will drain the signer's account of the given asset
      assetCloseTo: globals.zeroAddress,
    });

    const appCall = this.txnGroup[this.txn.groupIndex + 1];

    // Use assert instead of verifyTxn because applicationArgs array is not yet supported in verifyTxn
    assert(appCall.applicationID === this.APP_ID);
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
  verifyCreator(optIn: AssetTransferTxn): void {
    /** assert that the user has allowed optIns from the ASA creator */
    assert(this.allowedCreators([optIn.sender, optIn.xferAsset.creator]).value);
  }
}
