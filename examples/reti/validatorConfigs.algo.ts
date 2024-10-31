import { MAX_NODES, MAX_POOLS_PER_NODE } from './constants.algo';

export type ValidatorIdType = uint64;

/**
 * Represents a unique key for identifying validator pool entries.
 *
 * @typedef {object} ValidatorPoolKey
 * @property {ValidatorIdType} id - Unique identifier for the validator. The identifier value starts at 1; 0 is considered invalid and is used as a direct key in the box.
 * @property {uint64} poolId - Identifier for the pool. A value of 0 signifies invalid, with valid pool IDs starting from 1.
 * @property {uint64} poolAppId - Identifier for the pool application.
 */
export type ValidatorPoolKey = {
  id: ValidatorIdType; // 0 is invalid - should start at 1 (but is direct key in box)
  poolId: uint64; // 0 means INVALID ! - so 1 is index, technically of [0]
  poolAppId: uint64;
};

/**
 * ValidatorConfig represents the configuration settings for a given validator
 *
 * Properties:
 *
 * @typedef {Object} ValidatorConfig
 * @property {ValidatorIdType} id - The sequentially assigned identifier for the validator.
 * @property {Address} owner - The account address that controls this configuration, typically a cold wallet.
 * @property {Address} manager - The account that triggers/pays for payouts and key registration transactions. This needs to be a hot wallet as the node has to sign these transactions. This property is changeable.
 * @property {uint64} nfdForInfo - Optional NFD AppID which the validator uses to describe their validator pool. This property is changeable.
 * @property {uint8} entryGatingType - Specifies an optional gating mechanism that the staker must meet. This property is changeable.
 * @property {Address} entryGatingAddress - Address for GATING_TYPE_ASSETS_CREATED_BY gating type.
 * @property {StaticArray<uint64, 4>} entryGatingAssets - Array of assets used for gating mechanisms such as GATING_TYPE_ASSET_ID, GATING_TYPE_CREATED_BY_NFD_ADDRESSES, and GATING_TYPE_SEGMENT_OF_NFD. Only the first element is used in some gating types.
 * @property {uint64} gatingAssetMinBalance - Specifies a minimum token base units amount needed of an asset owned by the specified creator. If set to 0, the default requirement is at least 1 unit.
 * @property {uint64} rewardTokenId - Optional reward token ASA id. A validator can define a token that users are awarded in addition to ALGO.
 * @property {uint64} rewardPerPayout - Defines the amount of rewardTokenId that is rewarded per epoch across all pools based on their percentage stake of the validator's total. This property is changeable.
 * @property {uint32} epochRoundLength - Number of rounds per epoch. Example: 30,857 for approximately 24 hours with 2.8 second round times.
 * @property {uint32} percentToValidator - Payout percentage expressed with four decimal places. Example: 50000 represents 5% (0.05).
 * @property {Address} validatorCommissionAddress - Account that receives the validation commission each epoch payout. This can be a zero address. This property is changeable.
 * @property {uint64} minEntryStake - Minimum stake required to enter the pool. If a staker's balance goes below this amount, they must withdraw all stakes.
 * @property {uint64} maxAlgoPerPool - Maximum stake allowed per pool. If set to 0, current system limits are applied.
 * @property {uint8} poolsPerNode - Number of pools allowed per node. A maximum of 3 is recommended.
 * @property {uint64} sunsettingOn - Timestamp when the validator is set to sunset. This property is changeable.
 * @property {ValidatorIdType} sunsettingTo - The validator id to which this validator is moving. This property is changeable.
 */
export type ValidatorConfig = {
  id: ValidatorIdType; // id of this validator (sequentially assigned)
  owner: Address; // account that controls config - presumably cold-wallet

  // [CHANGEABLE] account that triggers/pays for payouts and keyreg transactions - needs to be hotwallet as node has to sign
  // for the transactions
  manager: Address;

  // [CHANGEABLE] Optional NFD AppID which the validator uses to describe their validator pool
  // NFD must be currently OWNED by address that adds the validator
  nfdForInfo: uint64;

  // [CHANGEABLE] entryGatingType / entryGatingValue specifies an optional gating mechanism - whose criteria
  // the staker must meet.
  // It will be the responsibility of the staker (txn composer really) to pick the right thing to check (as argument
  // to adding stake) that meets the criteria if this is set.
  // Allowed types:
  // 1) GATING_TYPE_ASSETS_CREATED_BY: assets created by address X (val is address of creator)
  // 2) GATING_TYPE_ASSET_ID: specific asset id (val is asset id)
  // 3) GATING_TYPE_CREATED_BY_NFD_ADDRESSES: asset in nfd linked addresses (value is nfd appid)
  // 4) GATING_TYPE_SEGMENT_OF_NFD: segment of a particular NFD (value is root appid)
  entryGatingType: uint8;
  entryGatingAddress: Address; // for GATING_TYPE_ASSETS_CREATED_BY
  entryGatingAssets: StaticArray<uint64, 4>; // all checked for GATING_TYPE_ASSET_ID, only first used for GATING_TYPE_CREATED_BY_NFD_ADDRESSES, and GATING_TYPE_SEGMENT_OF_NFD

  // [CHANGEABLE] gatingAssetMinBalance specifies a minimum token base units amount needed of an asset owned by the specified
  // creator (if defined).  If 0, then they need to hold at lest 1 unit, but its assumed this is for tokens, ie: hold
  // 10000[.000000] of token
  gatingAssetMinBalance: uint64;

  // Optional reward token info
  // Reward token ASA id: A validator can define a token that users are awarded in addition to
  // the ALGO they receive for being in the pool. This will allow projects to allow rewarding members their own
  // token.  Hold at least 5000 VEST to enter a Vestige staking pool, they have 1 day epochs and all
  // stakers get X amount of VEST as daily rewards (added to stakers ‘available’ balance) for removal at any time.
  rewardTokenId: uint64;
  // [CHANGEABLE] Reward rate : Defines the amount of rewardTokenId that is rewarded per epoch across all pools
  // (by their % stake of the validators total)
  rewardPerPayout: uint64;

  epochRoundLength: uint32; // Number of rounds per epoch - ie: 30,857 for approx 24hrs w/ 2.8s round times
  percentToValidator: uint32; // Payout percentage expressed w/ four decimals - ie: 50000 = 5% -> .0005 -

  validatorCommissionAddress: Address; // [CHANGEABLE] account that receives the validation commission each epoch payout (can be ZeroAddress)
  minEntryStake: uint64; // minimum stake required to enter pool - but must withdraw all if they want to go below this amount as well(!)
  maxAlgoPerPool: uint64; // maximum stake allowed per pool - if validator wants to restrict it.  0 means to use 'current' limits.
  poolsPerNode: uint8; // Number of pools to allow per node (max of 3 is recommended)

  sunsettingOn: uint64; // [CHANGEABLE] timestamp when validator will sunset (if != 0)
  sunsettingTo: ValidatorIdType; // [CHANGEABLE] validator id that validator is 'moving' to (if known)
};

/**
 * Overall state information for a given validator
 *
 * @typedef {Object} ValidatorCurState
 * @property {uint16} numPools - Current number of pools this validator has, capped at MaxPools.
 * @property {uint64} totalStakers - Total number of stakers across all pools of this validator.
 * @property {uint64} totalAlgoStaked - Total amount staked to this validator across all its pools.
 * @property {uint64} rewardTokenHeldBack - Amount of the reward token held back in pool 1 for paying out stakers their rewards. This value is updated as reward tokens are assigned to stakers and must be assumed 'spent,' only reducing as the token is actually sent out by request of the validator itself.
 */
export type ValidatorCurState = {
  numPools: uint16; // current number of pools this validator has - capped at MaxPools
  totalStakers: uint64; // total number of stakers across all pools of THIS validator
  totalAlgoStaked: uint64; // total amount staked to this validator across ALL of its pools
  // amount of the reward token held back in pool 1 for paying out stakers their rewards.
  // as reward tokens are assigned to stakers - the amount as part of each epoch will be updated
  // in this value and this amount has to be assumed 'spent' - only reducing this number as the token
  // is actually sent out by request of the validator itself
  rewardTokenHeldBack: uint64;
};

/**
 * Contains state information for a given staking pool.
 *
 * @typedef {Object} PoolInfo
 * @property {uint64} poolAppId - The App id of this staking pool contract instance.
 * @property {uint16} totalStakers - The total number of stakers in this pool.
 * @property {uint64} totalAlgoStaked - The total amount of Algo staked in this pool.
 */
export type PoolInfo = {
  poolAppId: uint64; // The App id of this staking pool contract instance
  totalStakers: uint16;
  totalAlgoStaked: uint64;
};

/**
 * A node's list of pool application ids assigned to it.
 *
 * @typedef {Object} NodeConfig
 * @property {StaticArray<uint64, typeof MAX_POOLS_PER_NODE>} poolAppIds - An array containing the application IDs of the pools associated with the node.
 */
type NodeConfig = {
  poolAppIds: StaticArray<uint64, typeof MAX_POOLS_PER_NODE>;
};

/**
 * Represents the configuration for assigning nodes to a node pool.
 *
 * @typedef {Object} NodePoolAssignmentConfig
 * @property {StaticArray<NodeConfig, typeof MAX_NODES>} nodes - A static array of node configurations with a maximum defined size.
 */
export type NodePoolAssignmentConfig = {
  nodes: StaticArray<NodeConfig, typeof MAX_NODES>;
};

/**
 * Represents the payout ratio for token pools in a staking system.
 *
 * @typedef {Object} PoolTokenPayoutRatio
 * @property {StaticArray<uint64, 24>} poolPctOfWhole - The percentage of a given pool vs all pools
 * @property {uint64} updatedForPayout - The round number when the payout ratio was last updated.
 */
export type PoolTokenPayoutRatio = {
  // MUST TRACK THE MAX_POOLS CONSTANT (MAX_POOLS_PER_NODE * MAX_NODES) !
  poolPctOfWhole: StaticArray<uint64, 24>;
  // current round when last set - only pool 1 caller can trigger/calculate this and only once per epoch
  // set and compared against pool 1's lastPayout property.
  updatedForPayout: uint64;
};

/**
 * ValidatorInfo provides a structure to store details about a validator's
 * configuration, current state, pool information, token payout ratio,
 * and node pool assignments.
 *
 * This represents the primary 'state' for a given Validator, storing its configuration parameters, its current
 * state (total staked to that validator, number of stakers..), data on each pool, node<->pool assignments, and
 * state used in token payouts.
 *
 * @typedef {Object} ValidatorInfo
 * @property {ValidatorConfig} config - The configuration settings of the validator.
 * @property {ValidatorCurState} state - The current state information of the validator.
 * @property {StaticArray<PoolInfo, 24>} pools - An array containing up to 24 pool information objects. This must track the max pools constant (MAX_POOLS_PER_NODE * MAX_NODES).
 * @property {PoolTokenPayoutRatio} tokenPayoutRatio - The ratio defining token payouts from pools.
 * @property {NodePoolAssignmentConfig} nodePoolAssignments - The configuration of assignments between nodes and pools.
 */
export type ValidatorInfo = {
  config: ValidatorConfig;
  state: ValidatorCurState;
  // MUST TRACK THE MAX_POOLS CONSTANT (MAX_POOLS_PER_NODE * MAX_NODES) !
  pools: StaticArray<PoolInfo, 24>;
  tokenPayoutRatio: PoolTokenPayoutRatio;
  nodePoolAssignments: NodePoolAssignmentConfig;
};

/**
 * MbrAmounts represents the Minimum Balance Requirements (MBR) for various operations in a staking or pooling environment.
 *
 * @typedef {Object} MbrAmounts
 * @property {uint64} addValidatorMbr - The Minimum Balance Requirement for adding a new validator.
 * @property {uint64} addPoolMbr - The Minimum Balance Requirement for creating a new pool.
 * @property {uint64} poolInitMbr - The initial Minimum Balance Requirement for starting a new pool.
 * @property {uint64} addStakerMbr - The Minimum Balance Requirement for adding a new staker to a pool.
 */
export type MbrAmounts = {
  addValidatorMbr: uint64;
  addPoolMbr: uint64;
  poolInitMbr: uint64;
  addStakerMbr: uint64;
};

/**
 * Constraints is the return type for getProtocolConstraints in the ValidatorRegistry.
 * It contains static as well as dynamic values based on current consensus data.
 */
export type Constraints = {
  epochPayoutRoundsMin: uint64;
  epochPayoutRoundsMax: uint64;
  minPctToValidatorWFourDecimals: uint64;
  maxPctToValidatorWFourDecimals: uint64;
  minEntryStake: uint64; // in microAlgo
  maxAlgoPerPool: uint64; // in microAlgo
  maxAlgoPerValidator: uint64; // in microAlgo
  amtConsideredSaturated: uint64; // soft stake - when saturation starts - in microAlgo
  maxNodes: uint64;
  maxPoolsPerNode: uint64;
  maxStakersPerPool: uint64;
};
