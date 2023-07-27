import { Contract } from '../../src/lib/index';

type Bytes256 = StaticArray<byte, 256>;

type Token = { owner: Address, uri: Bytes256, controller: Address }
type Control = { owner: Address, controller: Address }

// eslint-disable-next-line no-unused-vars
class ARC72 extends Contract {
  index = new GlobalStateKey<uint<256>>();

  tokenBox = new BoxMap<uint<256>, Token>();

  controlBox = new BoxMap<Control, bytes>();

  /**
   *
   * Returns the address of the current owner of the NFT with the given tokenId
   *
   * @param tokenId The ID of the NFT
   * @returns The current owner of the NFT
   */
  arc72_ownerOf(tokenId: uint<256>): Address {
    return this.tokenBox.get(tokenId).owner;
  }

  /**
   *
   * Returns a URI pointing to the NFT metadata
   *
   * @param tokenId The ID of the NFT
   * @returns URI to token metadata
   */
  arc72_tokenURI(tokenId: uint<256>): Bytes256 {
    return this.tokenBox.get(tokenId).uri;
  }

  private transferTo(to: Address, tokenId: uint<256>): void {
    this.tokenBox.get(tokenId).owner = to;
  }

  /**
   * Transfers ownership of an NFT
   */
  arc72_transferFrom(_from: Address, to: Address, tokenId: uint<256>): void {
    const token = this.tokenBox.get(tokenId);

    const key: Control = { owner: this.txn.sender, controller: _from };

    if (
      this.txn.sender === _from
      || this.txn.sender === token.controller
      || this.controlBox.exists(key)
    ) {
      this.transferTo(to, tokenId);
    } else throw Error('Transfer not authorized');
  }

  /**
   *
   * Approve a controller for a single NFT
   *
   * @param approved Approved controller address
   * @param tokenId The ID of the NFT
   */
  arc72_approve(approved: Address, tokenId: uint<256>): void {
    this.tokenBox.get(tokenId).controller = approved;
  }

  /**
   *
   * Approve an operator for all NFTs for a user
   *
   * @param operator Approved operator address
   * @param approved true to give approval, false to revoke
   * @returns
   */
  arc72_setApprovalForAll(operator: Address, approved: boolean): void {
    const key: Control = { owner: this.txn.sender, controller: operator };

    if (approved) this.controlBox.set(key, '');
    else if (this.controlBox.exists(key)) this.controlBox.delete(key);
  }

  mint(to: Address): void {
    const index = this.index.get();

    const token: Token = {
      owner: to,
      uri: 'https://github.com/algorandfoundation/ARCs' as Bytes256,
      controller: Address.zeroAddress,
    };

    this.tokenBox.set(index, token);
    this.transferTo(to, index);
    this.index.set(index + (1 as uint<256>));
  }

  /**
   * Returns the number of NFTs currently defined by this contract
   */
  arc72_totalSupply(): uint<256> {
    return this.index.get();
  }

  /**
   * Returns the token ID of the token with the given index among all NFTs defined by the contract
   */
  arc72_tokenByIndex(index: uint<256>): uint<256> {
    return index;
  }
}
