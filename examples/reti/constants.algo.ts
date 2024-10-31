export const MAX_STAKERS_PER_POOL = 200; // *64 (size of StakeInfo) = 12,800 bytes
export const MIN_ALGO_STAKE_PER_POOL = 1_000_000; // 1 ALGO

export const MAX_VALIDATOR_SOFT_PCT_OF_ONLINE_1DECIMAL = 100; // this is 10.0%, not 100... and represents the SOFT cap where validator is considered saturated
export const MAX_VALIDATOR_HARD_PCT_OF_ONLINE_1DECIMAL = 150; // 15% is HARD cap - no new stake if this reached

export const MIN_PCT_TO_VALIDATOR = 0; // minimum percentage is 0 - let the market decide
export const MAX_PCT_TO_VALIDATOR = 1000000; // 100% w/ four decimals (would be someone's own node for eg)

export const ALGORAND_ACCOUNT_MIN_BALANCE = 100000;
// values taken from: https://developer.algorand.org/docs/features/asc1/stateful/#minimum-balance-requirement-for-a-smart-contract
export const APPLICATION_BASE_FEE = 100000; // base fee for creating or opt-in to application
export const ASSET_HOLDING_FEE = 100000; // creation/holding fee for asset
export const SSC_VALUE_UINT = 28500; // cost for value as uint64
export const SSC_VALUE_BYTES = 50000; // cost for value as bytes

export const GATING_TYPE_NONE = 0;
export const GATING_TYPE_ASSETS_CREATED_BY = 1;
export const GATING_TYPE_ASSET_ID = 2;
export const GATING_TYPE_CREATED_BY_NFD_ADDRESSES = 3;
export const GATING_TYPE_SEGMENT_OF_NFD = 4;
// This constant needs to always be set to the highest value of the constants
export const GATING_TYPE_CONST_MAX = 4;
