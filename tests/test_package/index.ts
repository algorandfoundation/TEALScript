/* eslint-disable no-undef */
// @ts-expect-error We're not importing TEALScript so uint64 is not defined
export function packageFunction(a: uint64, b: uint64): uint64 {
  return a + b;
}
