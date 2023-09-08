/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/// <reference path="../../types/global.d.ts" />

export class PendingGroup {
  /**
  * Adds ABI method to the pending transaction group. The two type arguments in combination with the
  * name argument are used to form the the method signature to ensure typesafety.
  *
  * @typeParam ArgsType - A tuple type corresponding to the types of the method arguments
  * @typeParam ReturnType - The return type of the method
  *
  * @param params - The parameters of the method call
  *
  */
  addMethodCall<ArgsType, ReturnType>(
    params: Expand<MethodCallParams<ArgsType>>,
  ): void {}

  addPayment(params: Expand<PaymentParams>): void {}

  addAppCall(params: Expand<AppParams>): void {}

  addAssetTransfer(params: Expand<AssetTransferParams>): void {}

  addAssetCreation(params: Expand<AssetCreateParams>): void {}

  addOnlineKeyRegistration(params: Expand<OnlineKeyRegParams>): void {}

  addOfflineKeyRegistration(params: Expand<CommonTransactionParams>): void {}

  addAssetConfig(params: Expand<AssetConfigParams>): void {}

  addAssetFreeze(params: Expand<AssetFreezeParams>): void {}

  submit(): void {}
}

export default abstract class Contract {
  itxn!: Expand<
    AppOnChainTransactionParams &
    Partial<AppParams> &
    Partial<PaymentParams> &
    Partial<AssetCreateParams> &
    Partial<AssetTransferParams>
  >;

  txn!: Expand<ThisTxnParams>;

  txnGroup!: Txn[];

  app!: Application;

  pendingGroup!: PendingGroup;

  /**
   * The method called when creating the application. The default create method will
   * allow the contract to be created via a bare NoOp appcall and throw an error if called
   * with any arguments.
   */
  createApplication(...args: any[]): void {
    if (args.length > 0) {
      throw Error();
    }
  }

  /**
   * The method called when attempting to update the application. The default update method will
   * always throw an error
   */
  updateApplication(...args: any[]): void { throw Error(); }

  /**
   * The method called when attempting to delete the application. The default delete method will
   * always throw an error
   */
  deleteApplication(...args: any[]): void { throw Error(); }

  /**
   * The method called when an account opts-in to the application. The default opt-in method will
   * always throw an error
   */
  optInToApplication(...args: any[]): void { throw Error(); }

  /**
   * The method called when an account closes out their local state. The default close-out method
   * will always throw an error
   */
  closeOutOfApplication(...args: any[]): void { throw Error(); }

  /**
   * The method called when an account clears their local state. The default ClearState
   * method does nothing. ClearState will always allow a user to delete their local state,
   * reagrdless of logic.
   */
  clearState(): void { }
}
