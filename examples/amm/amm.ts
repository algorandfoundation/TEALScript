/* eslint-disable object-shorthand */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */

// eslint-disable-next-line import/no-unresolved, import/extensions
import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class ConstantProductAMM extends Contract {
  governor = new GlobalReference<Address>({ key: 'g' });

  assetA = new GlobalReference<Asset>({ key: 'a' });

  assetB = new GlobalReference<Asset>({ key: 'b' });

  poolToken = new GlobalReference<Asset>({ key: 'p' });

  ratio = new GlobalReference<uint64>({ key: 'r' });

  @handle.createApplication
  create(): void {
    this.governor.put(this.txn.sender);
  }

  private doCreatePoolToken(aAsset: Asset, bAsset: Asset): Asset {
    // Unit name asserts not needed since it's done automatically by Asset.unitName

    return sendAssetCreation({
      configAssetName: concat('DPT-', concat(aAsset.unitName, concat('-', bAsset.unitName))),
      configAssetUnitName: 'dpt',
      configAssetTotal: 1_000_000,
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
    const aRatio = wideRatio([aAmount, 1_000], [aSupply]);
    const bRatio = wideRatio([bAmount, 1_000], [bSupply]);

    const ratio = aRatio < bRatio ? aRatio : bRatio;

    return wideRatio([ratio, issued], [1_000]);
  }

  private computeRatio(): uint64 {
    return wideRatio(
      [this.app.address.assetBalance(this.assetA.get()), 1_000],
      [this.app.address.assetBalance(this.assetB.get())],
    );
  }

  private tokensToBurn(issued: uint64, supply: uint64, amount: uint64): uint64 {
    return wideRatio([supply, amount], [issued]);
  }

  private tokensToSwap(inAmount: uint64, inSupply: uint64, outSupply: uint64): uint64 {
    const factor = 1_000 - 5;
    return wideRatio(
      [inAmount, factor, outSupply],
      [(inSupply * 1_000) + (inAmount * factor)],
    );
  }

  set_governor(governor: Account): void {
    assert(this.txn.sender === this.governor.get());
    this.governor.put(governor);
  }

  bootstrap(seed: PayTxn, aAsset: Asset, bAsset: Asset): Asset {
    assert(this.txn.sender === this.governor.get());

    assert(globals.groupSize === 2);
    assert(seed.receiver === this.app.address);
    assert(seed.amount >= 300_000);
    assert(aAsset < bAsset);

    this.assetA.put(aAsset);
    this.assetB.put(bAsset);
    this.poolToken.put(this.doCreatePoolToken(aAsset, bAsset));

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
    assert(aXfer.sender === this.txn.sender && bXfer.sender === this.txn.sender);

    /// valid asset A axfer
    assert(aXfer.assetReceiver === this.app.address);
    assert(aXfer.xferAsset === aAsset);
    assert(aXfer.assetAmount > 0);

    /// valid asset B axfer
    assert(bXfer.assetReceiver === this.app.address);
    assert(bXfer.xferAsset === bAsset);
    assert(bXfer.assetAmount > 0);

    if (
      this.app.address.assetBalance(aAsset) === aXfer.assetAmount
      && this.app.address.assetBalance(bAsset) === bXfer.assetAmount
    ) {
      this.tokensToMintIntial(aXfer.assetAmount, bXfer.assetAmount);
    } else {
      // TODO: Compiler constants

      const toMint = this.tokensToMint(
        10_000_000_000 - this.app.address.assetBalance(poolAsset),
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
    assert(poolXfer.sender === this.txn.sender);

    /// valid pool axfer
    assert(poolXfer.assetReceiver === this.app.address);
    assert(poolXfer.xferAsset === poolAsset);
    assert(poolXfer.assetAmount > 0);
    assert(poolXfer.sender === this.txn.sender);

    const issued = 10_000_000_000
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

    this.ratio.put(this.computeRatio());
  }

  swap(swapXfer: AssetTransferTxn, aAsset: Asset, bAsset: Asset): void {
    /// well formed swap
    assert(aAsset === this.assetA.get());
    assert(bAsset === this.assetB.get());

    /// valid swap xfer
    assert(
      swapXfer.xferAsset === aAsset || swapXfer.xferAsset === bAsset,
    );
    assert(swapXfer.assetAmount > 0);
    assert(swapXfer.sender === this.txn.sender);

    const outId = swapXfer.xferAsset === aAsset ? aAsset : bAsset;

    const inId = swapXfer.xferAsset;

    const toSwap = this.tokensToSwap(
      swapXfer.assetAmount,
      this.app.address.assetBalance(inId) - swapXfer.assetAmount,
      this.app.address.assetBalance(outId),
    );

    assert(toSwap > 0);

    this.doAxfer(this.txn.sender, outId, toSwap);

    this.ratio.put(this.computeRatio());
  }
}
