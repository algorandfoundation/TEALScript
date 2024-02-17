import { VERSION } from '../../src/version';

export const TEAL = `#pragma version 10

// This TEAL was generated by TEALScript v${VERSION}
// https://github.com/algorandfoundation/TEALScript

// This contract is compliant with and/or implements the following ARCs: [ ARC4 ]

// The following ten lines of TEAL handle initial program flow
// This pattern is used to make it easy for anyone to parse the start of the program and determine if a specific action is allowed
// Here, action refers to the OnComplete in combination with whether the app is being created or called
// Every possible action for this contract is represented in the switch statement
// If the action is not implemented in the contract, its respective branch will be "*NOT_IMPLEMENTED" which just contains "err"
txn ApplicationID
!
int 6
*
txn OnCompletion
+
switch call_NoOp *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED create_NoOp *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED

*NOT_IMPLEMENTED:
	err

// doMath(uint64,uint64)uint64
*abi_route_doMath:
	// The ABI return prefix
	byte 0x151f7c75

	// b: uint64
	txna ApplicationArgs 2
	btoi

	// a: uint64
	txna ApplicationArgs 1
	btoi

	// execute doMath(uint64,uint64)uint64
	callsub doMath
	itob
	concat
	log
	int 1
	return

// doMath(a: number, b: number): number
//
// A method that gets the sum of two numbers
//
// @param a The first number
// @param b The second number
//
// @returns The sum
doMath:
	proto 2 1

	// examples/calculator/calculator.algo.ts:14
	// return a + b;
	frame_dig -1 // a: number
	frame_dig -2 // b: number
	+
	retsub

*abi_route_createApplication:
	int 1
	return

*create_NoOp:
	method "createApplication()void"
	txna ApplicationArgs 0
	match *abi_route_createApplication
	err

*call_NoOp:
	method "doMath(uint64,uint64)uint64"
	txna ApplicationArgs 0
	match *abi_route_doMath
	err`;
