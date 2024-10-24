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

export const MAX_NODES = 8; // more just as a reasonable limit and cap on contract storage
export const MAX_POOLS_PER_NODE = 3; // max number of pools per node
// This MAX_POOLS constant has to be explicitly specified in ValidatorInfo.pools[ xxx ] StaticArray!
// It also must be reflected in poolPctOfWhole in PoolTokenPayoutRatio!
// if this constant is changed, the calculated value must be put in manually into the StaticArray definition.
export const MAX_POOLS = MAX_NODES * MAX_POOLS_PER_NODE;

export const MIN_EPOCH_LENGTH = 1; // 1 round is technical minimum but its absurd - 20 would be approx 1 minute
export const MAX_EPOCH_LENGTH = 1000000; // 1 million rounds or.. just over a month ?
export const MAX_POOLS_PER_STAKER = 6;

export const ALGORAND_STAKING_BLOCK_DELAY = 320; // # of blocks until algorand sees online balance changes in staking
export const APPROX_AVG_ROUNDS_PER_DAY = 30857; // approx 'daily' rounds for APR bins (60*60*24/2.8)
