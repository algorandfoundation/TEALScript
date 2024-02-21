import { Contract } from '../../src/lib/index';

const TOTAL_SUPPLY = 10_000_000_000;
const SCALE = 1_000;
const FEE = 5;

// eslint-disable-next-line no-unused-vars
class ConstantProductAMM extends Contract {
  governor = GlobalStateKey<Address>({ key: 'g' });

  assetA = GlobalStateKey<AssetID>({ key: 'a' });

  assetB = GlobalStateKey<AssetID>({ key: 'b' });

  poolToken = GlobalStateKey<AssetID>({ key: 'p' });

  ratio = GlobalStateKey<uint64>({ key: 'r' });

  createApplication(): void {
    this.governor.value = this.txn.sender;
  }

  private doCreatePoolToken(aAsset: AssetID, bAsset: AssetID): AssetID {
    // Unit name asserts not needed since it's done automatically by AssetID.unitName

    return sendAssetCreation({
      configAssetName: 'DPT-' + aAsset.unitName + '-' + bAsset.unitName,
      configAssetUnitName: 'dpt',
      configAssetTotal: TOTAL_SUPPLY,
      configAssetDecimals: 3,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
    });
  }

  private doAxfer(receiver: Address, asset: AssetID, amount: uint64): void {
    sendAssetTransfer({
      assetReceiver: receiver,
      xferAsset: asset,
      assetAmount: amount,
    });
  }

  private doOptIn(asset: AssetID): void {
    this.doAxfer(this.app.address, asset, 0);
  }

  private tokensToMintIntial(aAmount: uint64, bAmount: uint64): uint64 {
    return sqrt(aAmount * bAmount);
  }

  private tokensToMint(issued: uint64, aSupply: uint64, bSupply: uint64, aAmount: uint64, bAmount: uint64): uint64 {
    const aRatio = wideRatio([aAmount, SCALE], [aSupply]);
    const bRatio = wideRatio([bAmount, SCALE], [bSupply]);

    const ratio = aRatio < bRatio ? aRatio : bRatio;

    return wideRatio([ratio, issued], [SCALE]);
  }

  private computeRatio(): uint64 {
    return wideRatio(
      [this.app.address.assetBalance(this.assetA.value), SCALE],
      [this.app.address.assetBalance(this.assetB.value)]
    );
  }

  private tokensToBurn(issued: uint64, supply: uint64, amount: uint64): uint64 {
    return wideRatio([supply, amount], [issued]);
  }

  private tokensToSwap(inAmount: uint64, inSupply: uint64, outSupply: uint64): uint64 {
    const factor = SCALE - FEE;
    return wideRatio([inAmount, factor, outSupply], [inSupply * SCALE + inAmount * factor]);
  }

  set_governor(governor: Address): void {
    verifyAppCallTxn(this.txn, { sender: this.governor.value });
    this.governor.value = governor;
  }

  bootstrap(seed: PayTxn, aAsset: AssetID, bAsset: AssetID): AssetID {
    verifyAppCallTxn(this.txn, { sender: this.governor.value });

    assert(globals.groupSize === 2);

    verifyPayTxn(seed, { receiver: this.app.address, amount: { greaterThanEqualTo: 300_000 } });
    assert(aAsset < bAsset);

    this.assetA.value = aAsset;
    this.assetB.value = bAsset;
    this.poolToken.value = this.doCreatePoolToken(aAsset, bAsset);

    this.doOptIn(aAsset);
    this.doOptIn(bAsset);

    return this.poolToken.value;
  }

  mint(aXfer: AssetTransferTxn, bXfer: AssetTransferTxn, poolAsset: AssetID, aAsset: AssetID, bAsset: AssetID): void {
    /// well formed mint
    assert(aAsset === this.assetA.value);
    assert(bAsset === this.assetB.value);
    assert(poolAsset === this.poolToken.value);

    /// valid asset A axfer
    verifyAssetTransferTxn(aXfer, {
      sender: this.txn.sender,
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      xferAsset: aAsset,
    });

    /// valid asset B axfer
    verifyAssetTransferTxn(bXfer, {
      sender: this.txn.sender,
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      xferAsset: bAsset,
    });

    if (
      this.app.address.assetBalance(aAsset) === aXfer.assetAmount &&
      this.app.address.assetBalance(bAsset) === bXfer.assetAmount
    ) {
      this.tokensToMintIntial(aXfer.assetAmount, bXfer.assetAmount);
    } else {
      const toMint = this.tokensToMint(
        TOTAL_SUPPLY - this.app.address.assetBalance(poolAsset),
        this.app.address.assetBalance(aAsset) - aXfer.assetAmount,
        this.app.address.assetBalance(bAsset) - bXfer.assetAmount,
        aXfer.assetAmount,
        bXfer.assetAmount
      );

      assert(toMint > 0);

      this.doAxfer(this.txn.sender, poolAsset, toMint);
    }
  }

  burn(poolXfer: AssetTransferTxn, poolAsset: AssetID, aAsset: AssetID, bAsset: AssetID): void {
    /// well formed burn
    assert(poolAsset === this.poolToken.value);
    assert(aAsset === this.assetA.value);
    assert(bAsset === this.assetB.value);

    /// valid pool axfer
    verifyAssetTransferTxn(poolXfer, {
      sender: this.txn.sender,
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      xferAsset: poolAsset,
    });

    const issued = TOTAL_SUPPLY - (this.app.address.assetBalance(poolAsset) - poolXfer.assetAmount);

    const aAmt = this.tokensToBurn(issued, this.app.address.assetBalance(aAsset), poolXfer.assetAmount);

    const bAmt = this.tokensToBurn(issued, this.app.address.assetBalance(bAsset), poolXfer.assetAmount);

    this.doAxfer(this.txn.sender, aAsset, aAmt);
    this.doAxfer(this.txn.sender, bAsset, bAmt);

    this.ratio.value = this.computeRatio();
  }

  swap(swapXfer: AssetTransferTxn, aAsset: AssetID, bAsset: AssetID): void {
    /// well formed swap
    assert(aAsset === this.assetA.value);
    assert(bAsset === this.assetB.value);

    verifyAssetTransferTxn(swapXfer, {
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      sender: this.txn.sender,
      xferAsset: { includedIn: [aAsset, bAsset] },
    });

    const outId = swapXfer.xferAsset === aAsset ? aAsset : bAsset;

    const inId = swapXfer.xferAsset;

    const toSwap = this.tokensToSwap(
      swapXfer.assetAmount,
      this.app.address.assetBalance(inId) - swapXfer.assetAmount,
      this.app.address.assetBalance(outId)
    );

    assert(toSwap > 0);

    this.doAxfer(this.txn.sender, outId, toSwap);

    this.ratio.value = this.computeRatio();
  }
}
