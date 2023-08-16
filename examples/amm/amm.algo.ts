import { Contract } from '../../src/lib/index';

const TOTAL_SUPPLY = 10_000_000_000;
const SCALE = 1_000;
const FEE = 5;

// eslint-disable-next-line no-unused-vars
class ConstantProductAMM extends Contract {
  governor = new GlobalStateKey<Address>({ key: 'g' });

  assetA = new GlobalStateKey<Asset>({ key: 'a' });

  assetB = new GlobalStateKey<Asset>({ key: 'b' });

  poolToken = new GlobalStateKey<Asset>({ key: 'p' });

  ratio = new GlobalStateKey<uint64>({ key: 'r' });

  createApplication(): void {
    this.governor.set(this.txn.sender);
  }

  private doCreatePoolToken(aAsset: Asset, bAsset: Asset): Asset {
    // Unit name asserts not needed since it's done automatically by Asset.unitName

    return sendAssetCreation({
      configAssetName: 'DPT-' + aAsset.unitName + '-' + bAsset.unitName,
      configAssetUnitName: 'dpt',
      configAssetTotal: TOTAL_SUPPLY,
      configAssetDecimals: 3,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
      fee: 0,
    });
  }

  private doAxfer(receiver: Account, asset: Asset, amount: uint64): void {
    sendAssetTransfer({
      assetReceiver: receiver,
      xferAsset: asset,
      assetAmount: amount,
      fee: 0,
    });
  }

  private doOptIn(asset: Asset): void {
    this.doAxfer(this.app.address, asset, 0);
  }

  private tokensToMintIntial(aAmount: uint64, bAmount: uint64): uint64 {
    return sqrt(aAmount * bAmount);
  }

  private tokensToMint(
    issued: uint64,
    aSupply: uint64,
    bSupply: uint64,
    aAmount: uint64,
    bAmount: uint64,
  ): uint64 {
    const aRatio = wideRatio([aAmount, SCALE], [aSupply]);
    const bRatio = wideRatio([bAmount, SCALE], [bSupply]);

    const ratio = aRatio < bRatio ? aRatio : bRatio;

    return wideRatio([ratio, issued], [SCALE]);
  }

  private computeRatio(): uint64 {
    return wideRatio(
      [this.app.address.assetBalance(this.assetA.get()), SCALE],
      [this.app.address.assetBalance(this.assetB.get())],
    );
  }

  private tokensToBurn(issued: uint64, supply: uint64, amount: uint64): uint64 {
    return wideRatio([supply, amount], [issued]);
  }

  private tokensToSwap(inAmount: uint64, inSupply: uint64, outSupply: uint64): uint64 {
    const factor = SCALE - FEE;
    return wideRatio(
      [inAmount, factor, outSupply],
      [(inSupply * SCALE) + (inAmount * factor)],
    );
  }

  set_governor(governor: Account): void {
    verifyTxn(this.txn, { sender: this.governor.get() });
    this.governor.set(governor);
  }

  bootstrap(seed: PayTxn, aAsset: Asset, bAsset: Asset): Asset {
    verifyTxn(this.txn, { sender: this.governor.get() });

    assert(globals.groupSize === 2);

    verifyTxn(seed, { receiver: this.app.address, amount: { greaterThanEqualTo: 300_000 } });
    assert(aAsset < bAsset);

    this.assetA.set(aAsset);
    this.assetB.set(bAsset);
    this.poolToken.set(this.doCreatePoolToken(aAsset, bAsset));

    this.doOptIn(aAsset);
    this.doOptIn(bAsset);

    return this.poolToken.get();
  }

  mint(
    aXfer: AssetTransferTxn,
    bXfer: AssetTransferTxn,
    poolAsset: Asset,
    aAsset: Asset,
    bAsset: Asset,
  ): void {
    /// well formed mint
    assert(aAsset === this.assetA.get());
    assert(bAsset === this.assetB.get());
    assert(poolAsset === this.poolToken.get());

    /// valid asset A axfer
    verifyTxn(aXfer, {
      sender: this.txn.sender,
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      xferAsset: aAsset,
    });

    /// valid asset B axfer
    verifyTxn(bXfer, {
      sender: this.txn.sender,
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      xferAsset: bAsset,
    });

    if (
      this.app.address.assetBalance(aAsset) === aXfer.assetAmount
      && this.app.address.assetBalance(bAsset) === bXfer.assetAmount
    ) {
      this.tokensToMintIntial(aXfer.assetAmount, bXfer.assetAmount);
    } else {
      const toMint = this.tokensToMint(
        TOTAL_SUPPLY - this.app.address.assetBalance(poolAsset),
        this.app.address.assetBalance(aAsset) - aXfer.assetAmount,
        this.app.address.assetBalance(bAsset) - bXfer.assetAmount,
        aXfer.assetAmount,
        bXfer.assetAmount,
      );

      assert(toMint > 0);

      this.doAxfer(this.txn.sender, poolAsset, toMint);
    }
  }

  burn(
    poolXfer: AssetTransferTxn,
    poolAsset: Asset,
    aAsset: Asset,
    bAsset: Asset,
  ): void {
    /// well formed burn
    assert(poolAsset === this.poolToken.get());
    assert(aAsset === this.assetA.get());
    assert(bAsset === this.assetB.get());

    /// valid pool axfer
    verifyTxn(poolXfer, {
      sender: this.txn.sender,
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      xferAsset: poolAsset,
    });

    const issued = TOTAL_SUPPLY
     - (this.app.address.assetBalance(poolAsset)
     - poolXfer.assetAmount);

    const aAmt = this.tokensToBurn(
      issued,
      this.app.address.assetBalance(aAsset),
      poolXfer.assetAmount,
    );

    const bAmt = this.tokensToBurn(
      issued,
      this.app.address.assetBalance(bAsset),
      poolXfer.assetAmount,
    );

    this.doAxfer(this.txn.sender, aAsset, aAmt);
    this.doAxfer(this.txn.sender, bAsset, bAmt);

    this.ratio.set(this.computeRatio());
  }

  swap(swapXfer: AssetTransferTxn, aAsset: Asset, bAsset: Asset): void {
    /// well formed swap
    assert(aAsset === this.assetA.get());
    assert(bAsset === this.assetB.get());

    verifyTxn(swapXfer, {
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
      this.app.address.assetBalance(outId),
    );

    assert(toSwap > 0);

    this.doAxfer(this.txn.sender, outId, toSwap);

    this.ratio.set(this.computeRatio());
  }
}
