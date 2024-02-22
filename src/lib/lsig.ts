/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/// <reference path="../../types/global.d.ts" />
import { classes } from 'polytype';

export default abstract class LogicSig {
  /**
   * Create a contract class that inherits from the given contracts. Inheritance is in order of arguments.
   */
  static extend: typeof classes;

  static address: () => Address;

  static program: () => bytes;

  txn!: Txn;

  txnGroup!: Txn[];

  /** The program version to use in the generated TEAL. This is the number used in the "#pragma version" directive */
  programVersion = 9;

  abstract logic(...args: any[]): void;
}
