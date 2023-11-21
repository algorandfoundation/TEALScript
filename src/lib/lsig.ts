/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/// <reference path="../../types/global.d.ts" />

export default abstract class LogicSig {
  static address: () => bytes;

  static program: () => bytes;

  txn!: Txn;

  txnGroup!: Txn[];

  /** The program version to use in the generated TEAL. This is the number used in the "#pragma version" directive */
  programVersion = 9;

  abstract logic(...args: any[]): void;
}
