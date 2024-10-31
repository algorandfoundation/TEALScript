/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-unused-vars */
import { Contract } from '../../src/lib/index';
// eslint-disable-next-line import/no-cycle
import { StakedInfo, StakingPool } from './stakingPool.algo';
import {
  ALGORAND_ACCOUNT_MIN_BALANCE,
  APPLICATION_BASE_FEE,
  ASSET_HOLDING_FEE,
  GATING_TYPE_ASSET_ID,
  GATING_TYPE_ASSETS_CREATED_BY,
  GATING_TYPE_CONST_MAX,
  GATING_TYPE_CREATED_BY_NFD_ADDRESSES,
  GATING_TYPE_NONE,
  GATING_TYPE_SEGMENT_OF_NFD,
  MAX_PCT_TO_VALIDATOR,
  MAX_STAKERS_PER_POOL,
  MAX_VALIDATOR_HARD_PCT_OF_ONLINE_1DECIMAL,
  MAX_VALIDATOR_SOFT_PCT_OF_ONLINE_1DECIMAL,
  MIN_ALGO_STAKE_PER_POOL,
  MIN_PCT_TO_VALIDATOR,
  SSC_VALUE_BYTES,
  SSC_VALUE_UINT,
} from './constants.algo';

const MAX_NODES = 8; // more just as a reasonable limit and cap on contract storage
const MAX_POOLS_PER_NODE = 3; // max number of pools per node
// This MAX_POOLS constant has to be explicitly specified in ValidatorInfo.pools[ xxx ] StaticArray!
// It also must be reflected in poolPctOfWhole in PoolTokenPayoutRatio!
// if this constant is changed, the calculated value must be put in manually into the StaticArray definition.
const MAX_POOLS = MAX_NODES * MAX_POOLS_PER_NODE;

const MIN_EPOCH_LENGTH = 1; // 1 round is technical minimum but its absurd - 20 would be approx 1 minute
const MAX_EPOCH_LENGTH = 1000000; // 1 million rounds or.. just over a month ?
const MAX_POOLS_PER_STAKER = 6;

type ValidatorIdType = uint64;
export type ValidatorPoolKey = {
  id: ValidatorIdType; // 0 is invalid - should start at 1 (but is direct key in box)
  poolId: uint64; // 0 means INVALID ! - so 1 is index, technically of [0]
  poolAppId: uint64;
};

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

type ValidatorCurState = {
  numPools: uint16; // current number of pools this validator has - capped at MaxPools
  totalStakers: uint64; // total number of stakers across all pools of THIS validator
  totalAlgoStaked: uint64; // total amount staked to this validator across ALL of its pools
  // amount of the reward token held back in pool 1 for paying out stakers their rewards.
  // as reward tokens are assigned to stakers - the amount as part of each epoch will be updated
  // in this value and this amount has to be assumed 'spent' - only reducing this number as the token
  // is actually sent out by request of the validator itself
  rewardTokenHeldBack: uint64;
};

type PoolInfo = {
  poolAppId: uint64; // The App id of this staking pool contract instance
  totalStakers: uint16;
  totalAlgoStaked: uint64;
};

type NodeConfig = {
  poolAppIds: StaticArray<uint64, typeof MAX_POOLS_PER_NODE>;
};

type NodePoolAssignmentConfig = {
  nodes: StaticArray<NodeConfig, typeof MAX_NODES>;
};

export type PoolTokenPayoutRatio = {
  // MUST TRACK THE MAX_POOLS CONSTANT (MAX_POOLS_PER_NODE * MAX_NODES) !
  poolPctOfWhole: StaticArray<uint64, 24>;
  // current round when last set - only pool 1 caller can trigger/calculate this and only once per epoch
  // set and compared against pool 1's lastPayout property.
  updatedForPayout: uint64;
};

type ValidatorInfo = {
  config: ValidatorConfig;
  state: ValidatorCurState;
  // MUST TRACK THE MAX_POOLS CONSTANT (MAX_POOLS_PER_NODE * MAX_NODES) !
  pools: StaticArray<PoolInfo, 24>;
  tokenPayoutRatio: PoolTokenPayoutRatio;
  nodePoolAssignments: NodePoolAssignmentConfig;
};

type MbrAmounts = {
  addValidatorMbr: uint64;
  addPoolMbr: uint64;
  poolInitMbr: uint64;
  addStakerMbr: uint64;
};

type Constraints = {
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

// eslint-disable-next-line no-unused-vars
/**
 * ValidatorRegistry is the 'master contract' for the reti pooling protocol.
 * A single immutable instance of this is deployed.  All state for all validators including information about their
 * pools and nodes is stored via this contract in global state and box storage.  Data in the pools themselves is stored
 * within the StakingPool contract instance, also in global state and box storage.
 * See the StakingPool contract comments for details on how this contract creates new instances of them.
 */
export class ValidatorRegistry extends Contract {
  programVersion = 10;

  // ======
  // GLOBAL STATE AND TEMPLATES
  // ======
  stakingPoolApprovalProgram = BoxKey<bytes>({ key: 'poolTemplateApprovalBytes' });

  stakingPoolInitialized = GlobalStateKey<boolean>({ key: 'init' });

  numValidators = GlobalStateKey<uint64>({ key: 'numV' });

  // Track the 'global' protocol number of stakers
  numStakers = GlobalStateKey<uint64>({ key: 'numStakers' });

  // Track the 'global' protocol amount of stake
  totalAlgoStaked = GlobalStateKey<uint64>({ key: 'staked' });

  // Validator list - simply incremental id - direct access to info for validator
  // and also contains all pool information (but not user-account ledger per pool)
  validatorList = BoxMap<ValidatorIdType, ValidatorInfo>({ prefix: 'v' });

  // For given user staker address, which of up to MAX_POOLS_PER_STAKER validator/pools are they in
  // We use this to find a particular addresses deposits (in up to X independent pools w/ any validators)
  stakerPoolSet = BoxMap<Address, StaticArray<ValidatorPoolKey, typeof MAX_POOLS_PER_STAKER>>({ prefix: 'sps' });

  nfdRegistryAppId = TemplateVar<uint64>();

  // ======
  // PUBLIC CONTRACT METHODS
  // ======
  // TODO - TEMPORARY!  just want these upgradeable until prior to final release so users don't have to keep
  // resetting every validator, and refund every staker.
  updateApplication(): void {
    assert(this.txn.sender === Address.fromAddress('LZ4V2IRVLCXFJK4REJV4TAGEKEYTA2GMR6TC2344OB3L3AF3MWXZ6ZAFIQ'));
    // reset our stored staking pool code as well so the new version can be loaded into box storage
    this.stakingPoolApprovalProgram.delete();
    this.stakingPoolInitialized.value = false;
  }

  createApplication(): void {
    this.stakingPoolInitialized.value = false;
    this.numValidators.value = 0;
    this.numStakers.value = 0;
    this.totalAlgoStaked.value = 0;
  }

  initStakingContract(approvalProgramSize: uint64): void {
    // can only be called once !
    this.stakingPoolApprovalProgram.create(approvalProgramSize);
  }

  loadStakingContractData(offset: uint64, data: bytes): void {
    assert(!this.stakingPoolInitialized.value);
    this.stakingPoolApprovalProgram.replace(offset, data);
  }

  finalizeStakingContract(): void {
    this.stakingPoolInitialized.value = true;
  }

  /**
   * gas is a dummy no-op call that can be used to pool-up resource references and opcode cost
   */
  gas(): void {}

  /**
   * Returns the MBR amounts needed for various actions:
   * [
   *  addValidatorMbr: uint64 - mbr needed to add a new validator - paid to validator contract
   *  addPoolMbr: uint64 - mbr needed to add a new pool - paid to validator
   *  poolInitMbr: uint64 - mbr needed to initStorage() of pool - paid to pool itself
   *  addStakerMbr: uint64 - mbr staker needs to add to first staking payment (stays w/ validator)
   * ]
   */
  getMbrAmounts(): MbrAmounts {
    // Cost for creator of validator contract itself is (but not really our problem - it's a bootstrap issue only)
    // this.minBalanceForAccount(0, 0, 0, 0, 0, 4, 0)
    return {
      addValidatorMbr: this.costForBoxStorage(1 /* v prefix */ + len<ValidatorIdType>() + len<ValidatorInfo>()),
      addPoolMbr: this.minBalanceForAccount(
        1,
        // we could calculate this directly by referencing the size of stakingPoolApprovalProgram but it would
        // mean our callers would have to reference the box AND buy up i/o - so just go max on extra pages
        3,
        0,
        0,
        0,
        StakingPool.schema.global.numUint,
        StakingPool.schema.global.numByteSlice
      ),
      poolInitMbr:
        ALGORAND_ACCOUNT_MIN_BALANCE +
        this.costForBoxStorage(7 /* 'stakers' name */ + len<StakedInfo>() * MAX_STAKERS_PER_POOL),
      addStakerMbr:
        // how much to charge for first time a staker adds stake - since we add a tracking box per staker
        this.costForBoxStorage(3 /* 'sps' prefix */ + len<Address>() + len<ValidatorPoolKey>() * MAX_POOLS_PER_STAKER), // size of key + all values
    };
  }

  /**
   * Returns the protocol constraints so that UIs can limit what users specify for validator configuration parameters.
   */
  getProtocolConstraints(): Constraints {
    return {
      epochPayoutRoundsMin: MIN_EPOCH_LENGTH,
      epochPayoutRoundsMax: MAX_EPOCH_LENGTH,
      minPctToValidatorWFourDecimals: MIN_PCT_TO_VALIDATOR,
      maxPctToValidatorWFourDecimals: MAX_PCT_TO_VALIDATOR,
      minEntryStake: MIN_ALGO_STAKE_PER_POOL,
      maxAlgoPerPool: this.maxAlgoAllowedPerPool(),
      maxAlgoPerValidator: this.maxAllowedStake(),
      amtConsideredSaturated: this.algoSaturationLevel(),
      maxNodes: MAX_NODES,
      maxPoolsPerNode: MAX_POOLS_PER_NODE,
      maxStakersPerPool: MAX_STAKERS_PER_POOL,
    };
  }

  /**
   * Returns the current number of validators
   */
  // @abi.readonly
  getNumValidators(): uint64 {
    return this.numValidators.value;
  }

  // @abi.readonly
  getValidatorConfig(validatorId: ValidatorIdType): ValidatorConfig {
    return this.validatorList(validatorId).value.config;
  }

  // @abi.readonly
  getValidatorState(validatorId: ValidatorIdType): ValidatorCurState {
    return this.validatorList(validatorId).value.state;
  }

  // @abi.readonly
  getValidatorOwnerAndManager(validatorId: ValidatorIdType): [Address, Address] {
    return [this.validatorList(validatorId).value.config.owner, this.validatorList(validatorId).value.config.manager];
  }

  // @abi.readonly
  /**
   * Return list of all pools for this validator.
   * @param {uint64} validatorId
   * @return {PoolInfo[]} - array of pools
   * Not callable from other contracts because >1K return but can be called w/ simulate which bumps log returns
   */
  getPools(validatorId: ValidatorIdType): PoolInfo[] {
    const retData: PoolInfo[] = [];
    const poolSet = clone(this.validatorList(validatorId).value.pools);
    for (let i = 0; i < poolSet.length; i += 1) {
      if (poolSet[i].poolAppId === 0) {
        // reached end of list...  we don't replace values here because pools can't be removed
        break;
      }
      retData.push(poolSet[i]);
    }
    return retData;
  }

  // @abi.readonly
  // getPoolAppId is useful for callers to determine app to call for removing stake if they don't have staking or
  // want to get staker list for an account.  The staking pool also uses it to get the app id of staking pool 1
  // (which contains reward tokens if being used) so that the amount available can be determined.
  getPoolAppId(validatorId: uint64, poolId: uint64): uint64 {
    assert(
      poolId !== 0 && poolId <= this.validatorList(validatorId).value.pools.length,
      'pool id must be between 1 and number of pools for this validator'
    );
    return this.validatorList(validatorId).value.pools[poolId - 1].poolAppId;
  }

  // @abi.readonly
  getPoolInfo(poolKey: ValidatorPoolKey): PoolInfo {
    return this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1];
  }

  /**
   * Calculate the maximum stake per pool for a given validator.
   * Normally this would be maxAlgoPerPool, but it should also never go above MaxAllowedStake / numPools so
   * as pools are added the max allowed per pool can reduce.
   *
   * @param {ValidatorIdType} validatorId - The id of the validator.
   */
  getCurMaxStakePerPool(validatorId: ValidatorIdType): uint64 {
    const numPools = this.validatorList(validatorId).value.state.numPools as uint64;
    const hardMaxDividedBetweenPools = this.maxAllowedStake() / numPools;
    let maxPerPool: uint64 = this.validatorList(validatorId).value.config.maxAlgoPerPool;
    if (maxPerPool === 0) {
      maxPerPool = this.maxAlgoAllowedPerPool();
    }
    if (hardMaxDividedBetweenPools < maxPerPool) {
      maxPerPool = hardMaxDividedBetweenPools;
    }
    return maxPerPool;
  }

  // @abi.readonly
  /**
   * Helper callers can call w/ simulate to determine if 'AddStaker' MBR should be included w/ staking amount
   * @param staker
   */
  doesStakerNeedToPayMBR(staker: Address): boolean {
    return !this.stakerPoolSet(staker).exists;
  }

  /**
   * Retrieves the staked pools for an account.
   *
   * @param {Address} staker - The account to retrieve staked pools for.
   * @return {ValidatorPoolKey[]} - The array of staked pools for the account.
   */
  getStakedPoolsForAccount(staker: Address): ValidatorPoolKey[] {
    if (!this.stakerPoolSet(staker).exists) {
      return [];
    }
    const retData: ValidatorPoolKey[] = [];
    const poolSet = clone(this.stakerPoolSet(staker).value);
    for (let i = 0; i < poolSet.length; i += 1) {
      if (poolSet[i].id !== 0) {
        retData.push(poolSet[i]);
      }
    }
    return retData;
  }

  // @abi.readonly
  /**
   * Retrieves the token payout ratio for a given validator - returning the pool ratios of whole so that token
   * payouts across pools can be based on a stable snaphost of stake.
   *
   * @param {ValidatorIdType} validatorId - The id of the validator.
   * @return {PoolTokenPayoutRatio} - The token payout ratio for the validator.
   */
  getTokenPayoutRatio(validatorId: ValidatorIdType): PoolTokenPayoutRatio {
    return this.validatorList(validatorId).value.tokenPayoutRatio;
  }

  // @abi.readonly
  getNodePoolAssignments(validatorId: uint64): NodePoolAssignmentConfig {
    assert(this.validatorList(validatorId).exists, "the specified validator id doesn't exist");

    return this.validatorList(validatorId).value.nodePoolAssignments;
  }

  getNFDRegistryID(): uint64 {
    return this.nfdRegistryAppId;
  }

  /** Adds a new validator
   * Requires at least 10 ALGO as the 'fee' for the transaction to help dissuade spammed validator adds.
   *
   * @param {PayTxn} mbrPayment payment from caller which covers mbr increase of new validator storage
   * @param {string} nfdName (Optional) Name of nfd (used as double-check against id specified in config)
   * @param {ValidatorConfig} config ValidatorConfig struct
   * @returns {uint64} validator id
   */
  addValidator(mbrPayment: PayTxn, nfdName: string, config: ValidatorConfig): uint64 {
    this.validateConfig(config);
    assert(config.owner !== Address.zeroAddress);
    assert(config.manager !== Address.zeroAddress);
    assert(this.txn.sender === config.owner, 'sender must be owner to add new validator');

    verifyPayTxn(mbrPayment, { amount: this.getMbrAmounts().addValidatorMbr });

    assert(mbrPayment.fee > 10 * 1000000, 'fee must be 10 ALGO or more to prevent spamming of validators');

    // We're adding a new validator - same owner might have multiple - we don't care.
    const validatorId = this.numValidators.value + 1;
    this.numValidators.value = validatorId;

    this.validatorList(validatorId).create();
    this.validatorList(validatorId).value.config = config;
    this.validatorList(validatorId).value.config.id = validatorId;
    // all other values being 0 is correct (for 'state' for eg)

    if (config.nfdForInfo !== 0) {
      // verify nfd is real, matches provided name, and owned by sender
      sendAppCall({
        applicationID: AppID.fromUint64(this.nfdRegistryAppId),
        applicationArgs: ['is_valid_nfd_appid', nfdName, itob(config.nfdForInfo)],
        applications: [AppID.fromUint64(config.nfdForInfo)],
      });
      assert(btoi(this.itxn.lastLog) === 1, "provided NFD isn't valid");
      // Verify the NFDs owner is same as our sender (presumably either owner or manager)
      assert(
        this.txn.sender === (AppID.fromUint64(config.nfdForInfo).globalState('i.owner.a') as Address),
        'If specifying NFD, account adding validator must be owner'
      );
    }
    if (
      config.entryGatingType === GATING_TYPE_CREATED_BY_NFD_ADDRESSES ||
      config.entryGatingType === GATING_TYPE_SEGMENT_OF_NFD
    ) {
      // verify gating NFD is at least 'real' - since we just have app id - fetch its name then do is valid call
      assert(this.isNFDAppIDValid(config.entryGatingAssets[0]), 'provided NFD App id for gating must be valid NFD');
    }
    // this.retiOP_addedValidator.log({ id: validatorId, owner: config.owner, manager: config.manager });
    return validatorId;
  }

  /**
   * Changes the Validator manager for a specific Validator id.
   * [ ONLY OWNER CAN CHANGE ]
   *
   * @param {ValidatorIdType} validatorId - The id of the validator to change the manager for.
   * @param {Address} manager - The new manager address.
   */
  changeValidatorManager(validatorId: ValidatorIdType, manager: Address): void {
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner,
      'can only be called by validator owner'
    );
    this.validatorList(validatorId).value.config.manager = manager;
  }

  /**
   * Updates the sunset information for a given validator.
   * [ ONLY OWNER CAN CHANGE ]
   *
   * @param {ValidatorIdType} validatorId - The id of the validator to update.
   * @param {uint64} sunsettingOn - The new sunset timestamp.
   * @param {uint64} sunsettingTo - The new sunset to validator id.
   */
  changeValidatorSunsetInfo(validatorId: ValidatorIdType, sunsettingOn: uint64, sunsettingTo: ValidatorIdType): void {
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner,
      'can only be called by validator owner'
    );
    this.validatorList(validatorId).value.config.sunsettingOn = sunsettingOn;
    this.validatorList(validatorId).value.config.sunsettingTo = sunsettingTo;
  }

  /**
   * Changes the NFD for a validator in the validatorList contract.
   * [ ONLY OWNER CAN CHANGE ]
   *
   * @param {ValidatorIdType} validatorId - The id of the validator to update.
   * @param {uint64} nfdAppID - The application id of the NFD to assign to the validator.
   * @param {string} nfdName - The name of the NFD (which must match)
   */
  changeValidatorNFD(validatorId: ValidatorIdType, nfdAppID: uint64, nfdName: string): void {
    // Must be called by the owner of the validator.
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner,
      'can only be called by validator owner'
    );
    // verify nfd is real, and owned by owner or manager
    sendAppCall({
      applicationID: AppID.fromUint64(this.nfdRegistryAppId),
      applicationArgs: ['is_valid_nfd_appid', nfdName, itob(nfdAppID)],
      applications: [AppID.fromUint64(nfdAppID)],
    });
    // we know sender is owner or manager - so if sender is owner of nfd - we're fine.
    assert(
      this.txn.sender === (AppID.fromUint64(nfdAppID).globalState('i.owner.a') as Address),
      'If specifying NFD, account adding validator must be owner'
    );
    this.validatorList(validatorId).value.config.nfdForInfo = nfdAppID;
  }

  /**
     * Change the commission address that validator rewards are sent to.
     [ ONLY OWNER CAN CHANGE ]
     */
  changeValidatorCommissionAddress(validatorId: ValidatorIdType, commissionAddress: Address): void {
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner,
      'can only be called by validator owner'
    );
    assert(commissionAddress !== Address.zeroAddress);
    this.validatorList(validatorId).value.config.validatorCommissionAddress = commissionAddress;
  }

  /**
   * Allow the additional rewards (gating entry, additional token rewards) information be changed at will.
   * [ ONLY OWNER CAN CHANGE ]
   */
  changeValidatorRewardInfo(
    validatorId: ValidatorIdType,
    EntryGatingType: uint8,
    EntryGatingAddress: Address,
    EntryGatingAssets: StaticArray<uint64, 4>,
    GatingAssetMinBalance: uint64,
    RewardPerPayout: uint64
  ): void {
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner,
      'can only be called by validator owner'
    );

    this.validatorList(validatorId).value.config.entryGatingType = EntryGatingType;
    this.validatorList(validatorId).value.config.entryGatingAddress = EntryGatingAddress;
    this.validatorList(validatorId).value.config.entryGatingAssets = EntryGatingAssets;
    this.validatorList(validatorId).value.config.gatingAssetMinBalance = GatingAssetMinBalance;
    this.validatorList(validatorId).value.config.rewardPerPayout = RewardPerPayout;
  }

  /**
   * Adds a new pool to a validator's pool set, returning the 'key' to reference the pool in the future for staking, etc.
   * The caller must pay the cost of the validators MBR increase as well as the MBR that will be needed for the pool itself.
   *
   * [ ONLY OWNER OR MANAGER CAN call ]
   * @param {PayTxn} mbrPayment payment from caller which covers mbr increase of adding a new pool
   * @param {uint64} validatorId is id of validator to pool to (must be owner or manager)
   * @param {uint64} nodeNum is node number to add to
   * @returns {ValidatorPoolKey} pool key to created pool
   *
   */
  addPool(mbrPayment: PayTxn, validatorId: ValidatorIdType, nodeNum: uint64): ValidatorPoolKey {
    // Must be called by the owner or manager of the validator.
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner ||
        this.txn.sender === this.validatorList(validatorId).value.config.manager,
      'can only be called by owner or manager of validator'
    );

    // must match MBR exactly
    verifyPayTxn(mbrPayment, { amount: this.getMbrAmounts().addPoolMbr, receiver: this.app.address });

    assert(this.validatorList(validatorId).exists, "specified validator id isn't valid");

    let numPools: uint64 = this.validatorList(validatorId).value.state.numPools as uint64;
    if ((numPools as uint64) >= MAX_POOLS) {
      throw Error('already at max pool size');
    }
    numPools += 1;

    // Create the actual staker pool contract instance
    sendAppCall({
      onCompletion: OnCompletion.NoOp,
      approvalProgram: [
        this.stakingPoolApprovalProgram.extract(0, 4096),
        this.stakingPoolApprovalProgram.extract(4096, this.stakingPoolApprovalProgram.size - 4096),
      ],
      clearStateProgram: StakingPool.clearProgram(),
      globalNumUint: StakingPool.schema.global.numUint,
      globalNumByteSlice: StakingPool.schema.global.numByteSlice,
      extraProgramPages: 3,
      applicationArgs: [
        // creatingContractID, validatorId, poolId, minEntryStake
        method('createApplication(uint64,uint64,uint64,uint64)void'),
        itob(this.app.id),
        itob(validatorId),
        itob(numPools as uint64),
        itob(this.validatorList(validatorId).value.config.minEntryStake),
      ],
    });

    this.validatorList(validatorId).value.state.numPools = numPools as uint16;
    // We don't need to manipulate anything in the pools array as the '0' values are all correct for PoolInfo
    // No stakers, no algo staked
    const poolAppId = this.itxn.createdApplicationID.id;
    this.validatorList(validatorId).value.pools[numPools - 1].poolAppId = poolAppId;
    this.addPoolToNode(validatorId, poolAppId, nodeNum);

    // this.retiOP_validatorAddedPool.log({
    //     id: validatorId,
    //     num: numPools as uint16,
    //     poolAppId: AppID.fromUint64(poolAppId),
    // });
    // PoolID is 1-based, 0 is invalid id
    return { id: validatorId, poolId: numPools as uint64, poolAppId: this.itxn!.createdApplicationID.id };
  }

  /**
   * Adds stake to a validator pool.
   *
   * @param {PayTxn} stakedAmountPayment - payment coming from staker to place into a pool
   * @param {ValidatorIdType} validatorId - The id of the validator.
   * @param {uint64} valueToVerify - only if validator has gating to enter - this is asset id or nfd id that corresponds to gating.
   * Txn sender is factored in as well if that is part of gating.
   * * @returns {ValidatorPoolKey} - The key of the validator pool.
   */
  addStake(stakedAmountPayment: PayTxn, validatorId: ValidatorIdType, valueToVerify: uint64): ValidatorPoolKey {
    assert(this.validatorList(validatorId).exists, "specified validator id isn't valid");

    // Ensure this validator hasn't reached its sunset date
    if (this.validatorList(validatorId).value.config.sunsettingOn > 0) {
      assert(
        this.validatorList(validatorId).value.config.sunsettingOn < globals.latestTimestamp,
        "can't stake with a validator that is past its sunsetting time"
      );
    }

    const staker = this.txn.sender;
    // The prior transaction should be a payment to this pool for the amount specified.  If this is stakers
    // first time staking, then we subtract the required MBR from their payment as that MBR amount needs to stay
    // behind in this contract to cover the MBR needed for creating the 'stakerPoolSet' storage.
    verifyPayTxn(stakedAmountPayment, {
      sender: staker,
      receiver: this.app.address,
    });

    // Ensure we're not over our protocol maximum for combined stake in all pools using the
    // MAX_VALIDATOR_HARD_PCT_OF_ONLINE_1DECIMAL percentage
    assert(
      this.validatorList(validatorId).value.state.totalAlgoStaked < this.maxAllowedStake(),
      'total staked for all of a validators pools may not exceed hard cap'
    );
    // If the validator specified that a specific token creator is required to stake, verify that the required
    // balance is held by the staker, and that the asset they offered up to validate was created by the account
    // the validator defined as its creator requirement.
    this.doesStakerMeetGating(validatorId, valueToVerify);

    let realAmount = stakedAmountPayment.amount;
    let mbrAmtLeftBehind: uint64 = 0;
    // determine if this is FIRST time this user has ever staked - they need to pay MBR
    if (!this.stakerPoolSet(staker).exists) {
      // We'll deduct the required MBR from what the user is depositing by telling callPoolAddState to leave
      // that amount behind and subtract from their depositing stake.
      mbrAmtLeftBehind = this.getMbrAmounts().addStakerMbr;
      realAmount -= mbrAmtLeftBehind;
      this.stakerPoolSet(staker).create();
    }
    // find existing slot where staker is already in a pool w/ this validator, or if none found, then ensure they're
    // putting in minimum amount for this validator.
    const findRet = this.findPoolForStaker(validatorId, staker, realAmount);
    const poolKey = findRet[0];
    const isNewStakerToValidator = findRet[1];
    const isNewStakerToProtocol = findRet[2];
    if (poolKey.poolId === 0) {
      throw Error('No pool available with free stake.  Validator needs to add another pool');
    }

    // Update StakerPoolList for this found pool (new or existing)
    this.updateStakerPoolSet(staker, poolKey);
    // Send the callers algo amount (- mbrAmtLeftBehind) to the specified staking pool, and it then updates
    // the staker data.
    this.callPoolAddStake(
      stakedAmountPayment,
      poolKey,
      mbrAmtLeftBehind,
      isNewStakerToValidator,
      isNewStakerToProtocol
    );
    // this.retiOP_stakeAdded.log({
    //     id: validatorId,
    //     poolNum: poolKey.poolId as uint16,
    //     poolAppId: AppID.fromUint64(poolKey.poolAppId),
    //     amountStaked: realAmount,
    //     staker: staker,
    // });

    return poolKey;
  }

  /**
   * setTokenPayoutRatio is called by Staking Pool # 1 (ONLY) to ask the validator (us) to calculate the ratios
   * of stake in the pools for subsequent token payouts (ie: 2 pools, '100' algo total staked, 60 in pool 1, and 40
   * in pool 2)  This is done so we have a stable snapshot of stake - taken once per epoch - only triggered by
   * pool 1 doing payout.  pools other than 1 doing payout call pool 1 to ask it do it first.
   * It would be 60/40% in the poolPctOfWhole values.  The token reward payouts then use these values instead of
   * their 'current' stake which changes as part of the payouts themselves (and people could be changing stake
   * during the epoch updates across pools)
   *
   * Multiple pools will call us via pool 1 (pool2->pool1->validator, etc.) so don't assert on pool1 calling multiple
   * times in same epoch.  Just return.
   *
   * @param validatorId - validator id (and thus pool) calling us.  Verified so that sender MUST be pool 1 of this validator.
   * @returns PoolTokenPayoutRatio - the finished ratio data
   */
  setTokenPayoutRatio(validatorId: ValidatorIdType): PoolTokenPayoutRatio {
    // Get pool 1 for this validator - caller MUST MATCH!
    const pool1AppID = this.validatorList(validatorId).value.pools[0].poolAppId;
    assert(pool1AppID !== 0);
    // Sender has to match the pool app id passed in - so we ensure only pool 1 can call us.
    if (this.txn.sender !== AppID.fromUint64(pool1AppID).address) {
      return this.validatorList(validatorId).value.tokenPayoutRatio;
    }

    // They can only call us if the epoch update time doesn't match what pool 1 already has - and it has to be at least
    // a full epoch since last update (unless not set).  Same check as pools themselves perform.
    // check which epoch we're currently in and if it's outside of last payout epoch.
    const curRound = globals.round;
    const lastPayoutUpdate = this.validatorList(validatorId).value.tokenPayoutRatio.updatedForPayout;
    if (lastPayoutUpdate !== 0) {
      // See if we've already done the calcs because payouts match - return what we already have.
      if ((AppID.fromUint64(pool1AppID).globalState('lastPayout') as uint64) === lastPayoutUpdate) {
        return this.validatorList(validatorId).value.tokenPayoutRatio;
      }
      const epochRoundLength = this.validatorList(validatorId).value.config.epochRoundLength as uint64;
      const thisEpochBegin = curRound - (curRound % epochRoundLength);
      // Make sure our last payout epoch isn't still within the current epoch - we need to be at least one epoch past the last payout.
      if (lastPayoutUpdate - (lastPayoutUpdate % epochRoundLength) === thisEpochBegin) {
        return this.validatorList(validatorId).value.tokenPayoutRatio;
      }
    }
    this.validatorList(validatorId).value.tokenPayoutRatio.updatedForPayout = curRound;

    const curNumPools = this.validatorList(validatorId).value.state.numPools as uint64;
    const totalStakeForValidator = this.validatorList(validatorId).value.state.totalAlgoStaked;
    for (let i = 0; i < curNumPools; i += 1) {
      // ie: this pool 2 has 1000 algo staked and the validator has 10,000 staked total (9000 pool 1, 1000 pool 2)
      // so this pool is 10% of the total and thus it gets 10% of the avail community token reward.
      // Get our pools pct of all stake w/ 4 decimals
      // ie, based on prior eg  - (1000 * 1e6) / 10000 = 100,000 (or 10%)
      const ourPoolPctOfWhole = wideRatio(
        [this.validatorList(validatorId).value.pools[i].totalAlgoStaked, 1_000_000],
        [totalStakeForValidator]
      );
      this.validatorList(validatorId).value.tokenPayoutRatio.poolPctOfWhole[i] = ourPoolPctOfWhole;
    }
    return this.validatorList(validatorId).value.tokenPayoutRatio;
  }

  /**
   * stakeUpdatedViaRewards is called by Staking pools to inform the validator (us) that a particular amount of total
   * stake has been added to the specified pool.  This is used to update the stats we have in our PoolInfo storage.
   * The calling App id is validated against our pool list as well.
   * @param {ValidatorPoolKey} poolKey - ValidatorPoolKey type
   * @param {uint64} algoToAdd - amount this validator's total stake increased via rewards
   * @param {uint64} rewardTokenAmountReserved - amount this validator's total stake increased via rewards (that should be
   * @param {uint64} validatorCommission - the commission amount the validator was paid, if any
   * @param {uint64} saturatedBurnToFeeSink - if the pool was in saturated state, the amount sent back to the fee sink.
   * seen as 'accounted for/pending spent')
   */
  stakeUpdatedViaRewards(
    poolKey: ValidatorPoolKey,
    algoToAdd: uint64,
    rewardTokenAmountReserved: uint64,
    validatorCommission: uint64,
    saturatedBurnToFeeSink: uint64
  ): void {
    this.verifyPoolKeyCaller(poolKey);

    // Update the specified amount of stake (+reward tokens reserved) - update pool stats, then total validator stats
    this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].totalAlgoStaked += algoToAdd;
    this.validatorList(poolKey.id).value.state.totalAlgoStaked += algoToAdd;
    this.validatorList(poolKey.id).value.state.rewardTokenHeldBack += rewardTokenAmountReserved;

    this.totalAlgoStaked.value += algoToAdd;

    // Re-validate the NFD as well while we're here, removing as associated nfd if no longer owner
    this.reverifyNFDOwnership(poolKey.id);

    // this.retiOP_epochRewardUpdate.log({
    //     id: poolKey.id,
    //     poolNum: poolKey.poolId as uint16,
    //     poolAppId: AppID.fromUint64(poolKey.poolAppId),
    //     algoAdded: algoToAdd,
    //     rewardTokenHeldBack: rewardTokenAmountReserved,
    //     saturatedBurnToFeeSink: saturatedBurnToFeeSink,
    //     validatorCommission: validatorCommission,
    // });
  }

  /**
     * stakeRemoved is called by Staking pools to inform the validator (us) that a particular amount of total stake has been removed
     * from the specified pool.  This is used to update the stats we have in our PoolInfo storage.
     * If any amount of rewardRemoved is specified, then that amount of reward is sent to the use
     * The calling App id is validated against our pool list as well.

     * @param {ValidatorPoolKey} poolKey calling us from which stake was removed
     * @param {Address} staker
     * @param {uint64} amountRemoved - algo amount removed
     * @param {uint64} rewardRemoved - if applicable, amount of token reward removed (by pool 1 caller) or TO remove and pay out (via pool 1 from different pool caller)
     * @param {boolean} stakerRemoved
     */
  stakeRemoved(
    poolKey: ValidatorPoolKey,
    staker: Address,
    amountRemoved: uint64,
    rewardRemoved: uint64,
    stakerRemoved: boolean
  ): void {
    if (globals.opcodeBudget < 300) {
      increaseOpcodeBudget();
    }
    this.verifyPoolKeyCaller(poolKey);

    // Yup - we've been called by an official staking pool telling us about stake that was removed from it,
    // so we can update our validator's staking stats.
    assert(amountRemoved > 0 || rewardRemoved > 0, 'should only be called if algo or reward was removed');

    // Remove the specified amount of stake - update pool stats, then total validator stats
    this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].totalAlgoStaked -= amountRemoved;
    this.validatorList(poolKey.id).value.state.totalAlgoStaked -= amountRemoved;
    this.totalAlgoStaked.value -= amountRemoved;

    if (rewardRemoved > 0) {
      const rewardTokenID = this.validatorList(poolKey.id).value.config.rewardTokenId;
      assert(rewardTokenID !== 0, "rewardRemoved can't be set if validator doesn't have reward token!");
      assert(
        this.validatorList(poolKey.id).value.state.rewardTokenHeldBack >= rewardRemoved,
        'reward being removed must be covered by hold back amount'
      );
      // If pool 1 is calling us, then they already sent the reward token to the staker and we just need to
      // update the rewardTokenHeldBack value and that's it.
      this.validatorList(poolKey.id).value.state.rewardTokenHeldBack -= rewardRemoved;

      // If a different pool called us, then they CAN'T send the token - we've already updated the
      // rewardTokenHeldBack value and then call method in the pool that can only be called by us (the
      // validator), and can only be called on pool 1 [Index 0] - to have it do the token payout.
      if (poolKey.poolId !== 1) {
        sendMethodCall<typeof StakingPool.prototype.payTokenReward>({
          applicationID: AppID.fromUint64(this.validatorList(poolKey.id).value.pools[0].poolAppId),
          methodArgs: [staker, rewardTokenID, rewardRemoved],
        });
      }
      // this.retiOP_stakeRemoved.log({
      //     id: poolKey.id,
      //     poolNum: poolKey.poolId as uint16,
      //     poolAppId: AppID.fromUint64(poolKey.poolAppId),
      //     staker: staker,
      //     amountUnstaked: amountRemoved,
      //     rewardTokenAssetId: AssetID.fromUint64(rewardTokenID),
      //     rewardTokensReceived: rewardRemoved,
      // });
    } else {
      // this.retiOP_stakeRemoved.log({
      //     id: poolKey.id,
      //     poolNum: poolKey.poolId as uint16,
      //     poolAppId: AppID.fromUint64(poolKey.poolAppId),
      //     staker: staker,
      //     amountUnstaked: amountRemoved,
      //     // no tokens rewarded..
      //     rewardTokenAssetId: AssetID.zeroIndex,
      //     rewardTokensReceived: 0,
      // });
    }

    if (stakerRemoved) {
      // remove from that pool
      this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].totalStakers -= 1;
      // then update the staker set.
      const removeRet = this.removeFromStakerPoolSet(staker, <ValidatorPoolKey>{
        id: poolKey.id,
        poolId: poolKey.poolId,
        poolAppId: poolKey.poolAppId,
      });
      const stakerOutOfThisValidator = removeRet[0];
      const stakerOutOfProtocol = removeRet[1];
      // then remove as a staker from validator stats if they're 'out' of that validators pools
      if (stakerOutOfThisValidator) {
        this.validatorList(poolKey.id).value.state.totalStakers -= 1;
      }
      // and remove from count of stakers in 'protocol' stats if they're out of ALL pools
      if (stakerOutOfProtocol) {
        this.numStakers.value -= 1;
      }
    }
  }

  /**
   * Finds the pool for a staker based on the provided validator id, staker address, and amount to stake.
   * First checks the stakers 'already staked list' for the validator preferring those (adding if possible) then adds
   * to new pool if necessary.
   *
   * @param {ValidatorIdType} validatorId - The id of the validator.
   * @param {Address} staker - The address of the staker.
   * @param {uint64} amountToStake - The amount to stake.
   * @returns {ValidatorPoolKey, boolean, boolean} - The pool for the staker, true/false on whether the staker is 'new'
   * to this VALIDATOR, and true/false if staker is new to the protocol.
   */
  findPoolForStaker(
    validatorId: ValidatorIdType,
    staker: Address,
    amountToStake: uint64
  ): [ValidatorPoolKey, boolean, boolean] {
    let isNewStakerToValidator = true;
    let isNewStakerToProtocol = true;
    // We have max per pool per validator - this value is stored in the pools as well, and they enforce it on their
    // addStake calls but the values should be the same, and we shouldn't even try to add stake if it won't even
    // be accepted.
    // However, one thing extra we also handle is have a 'soft' maximum per pool so that the amounts balance out based on
    // maxAllowedStake() (hard x % of all online stake) - taking that max / numPools.  This way as pools are added
    // to go beyond the individual pool maximum, the maximum for each pool starts to reflect the max allowed but
    // balanced across the pools.
    const maxPerPool = this.getCurMaxStakePerPool(validatorId);
    // If there's already a stake list for this account, walk that first, so if the staker is already in THIS
    // validator, then go to the stakers existing pool(s) w/ this validator first.
    if (this.stakerPoolSet(staker).exists) {
      const poolSet = clone(this.stakerPoolSet(staker).value);
      assert(validatorId !== 0);
      for (let i = 0; i < poolSet.length; i += 1) {
        if (globals.opcodeBudget < 300) {
          increaseOpcodeBudget();
        }
        if (poolSet[i].id === 0) {
          continue;
        }
        isNewStakerToProtocol = false;
        if (poolSet[i].id === validatorId) {
          // staker isn't new to this validator - but might still be out of room in this slot.
          isNewStakerToValidator = false;
          if (
            this.validatorList(validatorId).value.pools[poolSet[i].poolId - 1].totalAlgoStaked + amountToStake <=
            maxPerPool
          ) {
            return [poolSet[i], isNewStakerToValidator, isNewStakerToProtocol];
          }
        }
      }
    }

    // No existing stake found or that we fit in to, so ensure the stake meets the 'minimum entry' amount
    assert(
      amountToStake >= this.validatorList(validatorId).value.config.minEntryStake,
      'must stake at least the minimum for this pool'
    );

    // Walk their desired validators pools and find free space
    const pools = clone(this.validatorList(validatorId).value.pools);
    const curNumPools = this.validatorList(validatorId).value.state.numPools as uint64;
    for (let i = 0; i < curNumPools; i += 1) {
      if (pools[i].totalAlgoStaked + amountToStake <= maxPerPool) {
        return [
          { id: validatorId, poolId: i + 1, poolAppId: pools[i].poolAppId },
          isNewStakerToValidator,
          isNewStakerToProtocol,
        ];
      }
    }
    // Not found is poolId 0
    return [{ id: validatorId, poolId: 0, poolAppId: 0 }, isNewStakerToValidator, isNewStakerToProtocol];
  }

  /**
   * Find the specified pool (in any node number) and move it to the specified node.
   * The pool account is forced offline if moved so prior node will still run for 320 rounds but
   * new key goes online on new node soon after (320 rounds after it goes online)
   * No-op if success, asserts if not found or can't move  (no space in target)
   * [ ONLY OWNER OR MANAGER CAN CHANGE ]
   *
   * @param {ValidatorIdType} validatorId - The id of the validator.
   * @param {uint64} poolAppId
   * @param {uint64} nodeNum
   */
  movePoolToNode(validatorId: ValidatorIdType, poolAppId: uint64, nodeNum: uint64): void {
    // Must be called by the owner or manager of the validator.
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner ||
        this.txn.sender === this.validatorList(validatorId).value.config.manager,
      'can only be called by owner or manager of validator'
    );

    const nodePoolAssignments = clone(this.validatorList(validatorId).value.nodePoolAssignments);
    assert(nodeNum >= 1 && nodeNum <= MAX_NODES, 'node number out of allowable range');
    // iterate  all the poolAppIds slots to find the specified poolAppId
    for (let srcNodeIdx = 0; srcNodeIdx < MAX_NODES; srcNodeIdx += 1) {
      for (let i = 0; i < MAX_POOLS_PER_NODE; i += 1) {
        if (nodePoolAssignments.nodes[srcNodeIdx].poolAppIds[i] === poolAppId) {
          assert(nodeNum - 1 !== srcNodeIdx, "can't move to same node");
          // found it - clear this slot
          this.validatorList(validatorId).value.nodePoolAssignments.nodes[srcNodeIdx].poolAppIds[i] = 0;

          // Force that pool offline since it's moving nodes !
          sendMethodCall<typeof StakingPool.prototype.goOffline>({
            applicationID: AppID.fromUint64(poolAppId),
          });

          // now - add it to desired node
          this.addPoolToNode(validatorId, poolAppId, nodeNum);
          return;
        }
      }
    }
    throw Error("couldn't find pool app id in nodes to move");
  }

  /**
   * Sends the reward tokens held in pool 1 to specified receiver.
   * This is intended to be used by the owner when they want to get reward tokens 'back' which they sent to
   * the first pool (likely because validator is sunsetting.  Any tokens currently 'reserved' for stakers to claim will
   * NOT be sent as they must be held back for stakers to later claim.
   * [ ONLY OWNER CAN CALL]
   *
   * @param {ValidatorIdType} validatorId - The id of the validator.
   * @param {Address} receiver - the account to send the tokens to (must already be opted-in to the reward token)
   * @returns {uint64} the amount of reward token sent
   */
  emptyTokenRewards(validatorId: ValidatorIdType, receiver: Address): uint64 {
    assert(
      this.txn.sender === this.validatorList(validatorId).value.config.owner,
      'can only be called by validator owner'
    );
    const rewardTokenId = this.validatorList(validatorId).value.config.rewardTokenId;
    const rewardTokenHeldBack = this.validatorList(validatorId).value.state.rewardTokenHeldBack;
    assert(rewardTokenId !== 0, "this validator doesn't have a reward token defined");
    const poolOneAppId = AppID.fromUint64(this.validatorList(validatorId).value.pools[0].poolAppId);
    // get reward token balance in pool 1 (excluding the hold back amount)
    const tokenRewardBal = poolOneAppId.address.assetBalance(AssetID.fromUint64(rewardTokenId)) - rewardTokenHeldBack;

    // call pool 1 to send the token (minus the amount reserved) to the receiver
    sendMethodCall<typeof StakingPool.prototype.payTokenReward>({
      applicationID: poolOneAppId,
      methodArgs: [receiver, rewardTokenId, tokenRewardBal],
    });
    assert(
      poolOneAppId.address.assetBalance(AssetID.fromUint64(rewardTokenId)) === rewardTokenHeldBack,
      'balance of remaining reward tokens should match the held back amount'
    );
    return tokenRewardBal;
  }

  // ======
  // EVENTS - logged for notable changes
  // ======

  /**
   * Logs the addition of a new validator to the system, its initial owner and manager
   */
  // retiOP_addedValidator = new EventLogger<{
  //     // Assigned Validator ID
  //     id: uint64;
  //     // Owner account
  //     owner: Address;
  //     // Manager account
  //     manager: Address;
  // }>();
  //
  // /**
  //  * Logs the addition of a new pool to a particular validator ID
  //  */
  // retiOP_validatorAddedPool = new EventLogger<{
  //     // Validator ID
  //     id: uint64;
  //     // Pool number
  //     num: uint16;
  //     // Pool application ID
  //     poolAppId: AppID;
  // }>();
  //
  // /**
  //  * Logs how much stake was added by a staker to a particular staking pool
  //  */
  // retiOP_stakeAdded = new EventLogger<{
  //     // Validator ID staker staked with
  //     id: uint64;
  //     // Pool number stake went to
  //     poolNum: uint16;
  //     // Pool application ID
  //     poolAppId: AppID;
  //     // Staker account
  //     staker: Address;
  //     // Amount staked
  //     amountStaked: uint64;
  // }>();
  //
  // /**
  //  * Logs how much algo was detected as being added to a staking pool as part of epoch reward calculations.
  //  * Commission amount to validator, excess burned if pool is saturated, and the amount of tokens held back are logged as well.
  //  */
  // retiOP_epochRewardUpdate = new EventLogger<{
  //     // Validator ID
  //     id: uint64;
  //     // Pool number rewards were accounted for
  //     poolNum: uint16;
  //     // Pool application ID
  //     poolAppId: AppID;
  //     // Amount validator received (if anything)
  //     validatorCommission: uint64;
  //     // Saturated burn sent BACK to fee sink (if saturated pool)
  //     saturatedBurnToFeeSink: uint64;
  //     // Algo amount added
  //     algoAdded: uint64;
  //     // Reward token amount held back for future payout
  //     rewardTokenHeldBack: uint64;
  // }>();
  //
  // /**
  //  * Logs how much stake was removed by a staker from a particular staking pool
  //  */
  // retiOP_stakeRemoved = new EventLogger<{
  //     // Validator ID staker staked with
  //     id: uint64;
  //     // Pool number stake was removed from
  //     poolNum: uint16;
  //     // Pool application ID
  //     poolAppId: AppID;
  //     // Staker account
  //     staker: Address;
  //     // Amount of stake removed
  //     amountUnstaked: uint64;
  //     // Number of reward tokens also received
  //     rewardTokensReceived: uint64;
  //     // Reward token (if applicable) asset id
  //     rewardTokenAssetId: AssetID;
  // }>();

  // ======
  // PRIVATE CONTRACT METHODS
  // Callable only internally
  // ======
  /**
   * verifyPoolKeyCaller verifies the passed in key (from a staking pool calling us to update metrics) is valid
   * and matches the information we have in our state.  'Fake' pools could call us to update our data, but they
   * can't fake the ids and most importantly application id(!) of the caller that has to match.
   */
  private verifyPoolKeyCaller(poolKey: ValidatorPoolKey): void {
    assert(this.validatorList(poolKey.id).exists, "the specified validator id isn't valid");
    assert(poolKey.poolId <= MAX_POOLS, 'pool id not in valid range');
    assert(
      poolKey.poolId > 0 && (poolKey.poolId as uint16) <= this.validatorList(poolKey.id).value.state.numPools,
      'pool id outside of range of pools created for this validator'
    );
    // validator id, pool id, pool app id might still be kind of spoofed, but they can't spoof us verifying they called us from
    // the contract address of the pool app id they represent.
    assert(
      poolKey.poolAppId === this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].poolAppId,
      "The passed in app id doesn't match the passed in ids"
    );
    // Sender has to match the pool app id passed in as well.
    assert(this.txn.sender === AppID.fromUint64(poolKey.poolAppId).address);
    // verify the state of the specified app (the staking pool itself) state matches as well !
    assert(poolKey.id === (AppID.fromUint64(poolKey.poolAppId).globalState('validatorId') as uint64));
    assert(poolKey.poolId === (AppID.fromUint64(poolKey.poolAppId).globalState('poolId') as uint64));
  }

  /**
   * This method verifies the ownership of NFD (Named Function Data) by a validator.
   * If the ownership is no longer valid, it removes the NFD from the validator's configuration.
   *
   * @param {ValidatorIdType} validatorId - The id of the validator whose data should be re-evaluated.
   */
  private reverifyNFDOwnership(validatorId: ValidatorIdType): void {
    const validatorConfig = this.validatorList(validatorId).value.config;
    if (validatorConfig.nfdForInfo !== 0) {
      // We already verified the nfd id and name were correct at creation time - so we don't need to verify
      // the nfd is real anymore, just that its still owned by the validator.
      const nfdOwner = AppID.fromUint64(validatorConfig.nfdForInfo).globalState('i.owner.a') as Address;
      // If they no longer own the nfd - remove it (!) from the validator config
      if (validatorConfig.owner !== nfdOwner && validatorConfig.manager !== nfdOwner) {
        // Remove the NFD from this validator !
        this.validatorList(validatorId).value.config.nfdForInfo = 0;
      }
    }
  }

  private validateConfig(config: ValidatorConfig): void {
    // Verify all the values in the ValidatorConfig are correct
    assert(
      config.entryGatingType >= GATING_TYPE_NONE && config.entryGatingType <= GATING_TYPE_CONST_MAX,
      'gating type not valid'
    );
    assert(
      config.epochRoundLength >= MIN_EPOCH_LENGTH && config.epochRoundLength <= MAX_EPOCH_LENGTH,
      'epoch length not in allowable range'
    );
    assert(
      config.percentToValidator >= MIN_PCT_TO_VALIDATOR && config.percentToValidator <= MAX_PCT_TO_VALIDATOR,
      'commission percentage not valid'
    );
    if (config.percentToValidator !== 0) {
      assert(
        config.validatorCommissionAddress !== Address.zeroAddress,
        'validatorCommissionAddress must be set if percent to validator is not 0'
      );
    }
    assert(config.minEntryStake >= MIN_ALGO_STAKE_PER_POOL, 'staking pool must have minimum entry of 1 algo');
    // we don't care about maxAlgoPerPool - if set to 0 it floats w/ network incentive values: maxAlgoAllowedPerPool()
    assert(
      config.poolsPerNode > 0 && config.poolsPerNode <= MAX_POOLS_PER_NODE,
      'number of pools per node exceeds allowed number'
    );
    if (config.sunsettingOn !== 0) {
      assert(config.sunsettingOn > globals.latestTimestamp, 'sunsettingOn must be later than now if set');
    }
  }

  /**
   * Adds a stakers amount of algo to a validator pool, transferring the algo we received from them (already verified
   * by our caller) to the staking pool account, and then telling it about the amount being added for the specified
   * staker.
   *
   * @param {PayTxn} stakedAmountPayment - payment coming from staker to place into a pool
   * @param {ValidatorPoolKey} poolKey - The key of the validator pool.
   * @param {uint64} mbrAmtPaid - Amount the user is leaving behind in the validator to pay for their staker MBR cost
   * @param {boolean} isNewStakerToValidator - if this is a new, first-time staker to the validator
   * @param {boolean} isNewStakerToProtocol - if this is a new, first-time staker to the protocol
   */
  private callPoolAddStake(
    stakedAmountPayment: PayTxn,
    poolKey: ValidatorPoolKey,
    mbrAmtPaid: uint64,
    isNewStakerToValidator: boolean,
    isNewStakerToProtocol: boolean
  ): void {
    const poolAppId = this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].poolAppId;

    // forward the payment on to the pool via 2 txns
    // payment + 'add stake' call
    sendMethodCall<typeof StakingPool.prototype.addStake, uint64>({
      applicationID: AppID.fromUint64(poolAppId),
      methodArgs: [
        // =======
        // THIS IS A SEND of the amount received right back out and into the staking pool contract account.
        { amount: stakedAmountPayment.amount - mbrAmtPaid, receiver: AppID.fromUint64(poolAppId).address },
        // =======
        stakedAmountPayment.sender,
      ],
    });
    if (globals.opcodeBudget < 500) {
      increaseOpcodeBudget();
    }

    // Stake has been added to the pool - get its new totals and add to our own tracking data
    const poolNumStakers = AppID.fromUint64(poolAppId).globalState('numStakers') as uint64;
    const poolAlgoStaked = AppID.fromUint64(poolAppId).globalState('staked') as uint64;
    this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].totalStakers = poolNumStakers as uint16;
    this.validatorList(poolKey.id).value.pools[poolKey.poolId - 1].totalAlgoStaked = poolAlgoStaked;

    // now update our validator and global totals
    if (isNewStakerToValidator) {
      this.validatorList(poolKey.id).value.state.totalStakers += 1;
    }
    if (isNewStakerToProtocol) {
      this.numStakers.value += 1;
    }
    this.validatorList(poolKey.id).value.state.totalAlgoStaked += stakedAmountPayment.amount - mbrAmtPaid;
    this.totalAlgoStaked.value += stakedAmountPayment.amount - mbrAmtPaid;
  }

  private updateStakerPoolSet(staker: Address, poolKey: ValidatorPoolKey) {
    assert(this.stakerPoolSet(staker).exists);

    const poolSet = clone(this.stakerPoolSet(staker).value);
    let firstEmpty = 0;
    for (let i = 0; i < this.stakerPoolSet(staker).value.length; i += 1) {
      if (poolSet[i] === poolKey) {
        // all bytes compare - already in pool set
        return;
      }
      if (firstEmpty === 0 && poolSet[i].id === 0) {
        firstEmpty = i + 1;
      }
    }
    if (firstEmpty === 0) {
      throw Error('No empty slot available in the staker pool set');
    }
    this.stakerPoolSet(staker).value[firstEmpty - 1] = poolKey;
  }

  /**
   * Removes a pool key from the staker's active pool set - fails if not found (!)
   *
   * @param {Address} staker - The address of the staker.
   * @param {ValidatorPoolKey} poolKey - The pool key they should be stored in
   *
   * @return [boolean, boolean] [is the staker gone from ALL pools of the given VALIDATOR, and is staker gone from ALL pools]
   */
  private removeFromStakerPoolSet(staker: Address, poolKey: ValidatorPoolKey): [boolean, boolean] {
    // track how many pools staker is in, so we  can know if they remove all stake from all pools of this validator
    let inSameValidatorPoolCount = 0;
    let inAnyPoolCount = 0;
    let found = false;

    const poolSet = clone(this.stakerPoolSet(staker).value);
    for (let i = 0; i < this.stakerPoolSet(staker).value.length; i += 1) {
      if (poolSet[i].id === 0) {
        continue;
      }
      inAnyPoolCount += 1;
      if (poolSet[i].id === poolKey.id) {
        if (poolSet[i] === poolKey) {
          found = true;
          // 'zero' it out
          this.stakerPoolSet(staker).value[i] = { id: 0, poolId: 0, poolAppId: 0 };
        } else {
          inSameValidatorPoolCount += 1;
        }
      }
    }
    if (!found) {
      throw Error('No matching slot found when told to remove a pool from the stakers set');
    }
    // Are they completely out of the staking pool ?
    return [inSameValidatorPoolCount === 0, inAnyPoolCount === 0];
  }

  private addPoolToNode(validatorId: ValidatorIdType, poolAppId: uint64, nodeNum: uint64) {
    const nodePoolAssignments = clone(this.validatorList(validatorId).value.nodePoolAssignments);
    const maxPoolsPerNodeForThisValidator = this.validatorList(validatorId).value.config.poolsPerNode as uint64;
    // add the new staking pool to the specified node number - if there is room
    assert(nodeNum >= 1 && nodeNum <= MAX_NODES, 'node number not in valid range');
    // iterate all the poolAppIds slots to see if any are free (appid of 0)
    for (let i = 0; i < maxPoolsPerNodeForThisValidator; i += 1) {
      if (nodePoolAssignments.nodes[nodeNum - 1].poolAppIds[i] === 0) {
        // update box data
        this.validatorList(validatorId).value.nodePoolAssignments.nodes[nodeNum - 1].poolAppIds[i] = poolAppId;
        return;
      }
    }
    throw Error('no available space in specified node for this pool');
  }

  /**
   * Checks if a staker meets the gating requirements specified by the validator.
   *
   * @param {ValidatorIdType} validatorId - The id of the validator.
   * @param {uint64} valueToVerify - The value to verify against the gating requirements.
   * @returns {void} or asserts if requirements not met.
   */
  private doesStakerMeetGating(validatorId: ValidatorIdType, valueToVerify: uint64): void {
    const type = this.validatorList(validatorId).value.config.entryGatingType;
    if (type === GATING_TYPE_NONE) {
      return;
    }
    const staker = this.txn.sender;
    const config = clone(this.validatorList(validatorId).value.config);

    // If an asset gating - check the balance requirement - can handle whether right asset afterward
    if (
      type === GATING_TYPE_ASSETS_CREATED_BY ||
      type === GATING_TYPE_ASSET_ID ||
      type === GATING_TYPE_CREATED_BY_NFD_ADDRESSES
    ) {
      assert(valueToVerify !== 0);
      let balRequired = this.validatorList(validatorId).value.config.gatingAssetMinBalance;
      if (balRequired === 0) {
        balRequired = 1;
      }
      assert(
        staker.assetBalance(AssetID.fromUint64(valueToVerify)) >= balRequired,
        'must have required minimum balance of validator defined token to add stake'
      );
    }
    if (type === GATING_TYPE_ASSETS_CREATED_BY) {
      assert(
        AssetID.fromUint64(valueToVerify).creator === config.entryGatingAddress,
        'specified asset must be created by creator that the validator defined as a requirement to stake'
      );
    }
    if (type === GATING_TYPE_ASSET_ID) {
      assert(valueToVerify !== 0);
      let found = false;
      for (const assetId of config.entryGatingAssets) {
        if (valueToVerify === assetId) {
          found = true;
          break;
        }
      }
      assert(found, 'specified asset must be identical to the asset id defined as a requirement to stake');
    }
    if (type === GATING_TYPE_CREATED_BY_NFD_ADDRESSES) {
      // Walk all the linked addresses defined by the gating NFD (stored packed in v.caAlgo.0.as as a 'set' of 32-byte PKs)
      // if any are the creator of the specified asset then we pass.
      assert(
        this.isAddressInNFDCAAlgoList(config.entryGatingAssets[0], AssetID.fromUint64(valueToVerify).creator),
        'specified asset must be created by creator that is one of the linked addresses in an nfd'
      );
    }
    if (type === GATING_TYPE_SEGMENT_OF_NFD) {
      // verify NFD user wants to offer up for testing is at least 'real' - since we just have app id - fetch its name then do is valid call
      const userOfferedNFDAppID = valueToVerify;
      assert(this.isNFDAppIDValid(userOfferedNFDAppID), 'provided NFD must be valid');

      // now see if specified NFD's owner, or any of its caAlgo fields matches the staker's address
      assert(
        rawBytes(AppID.fromUint64(userOfferedNFDAppID).globalState('i.owner.a') as Address) === rawBytes(staker) ||
          this.isAddressInNFDCAAlgoList(userOfferedNFDAppID, staker),
        "provided nfd for entry isn't owned or linked to the staker"
      );

      // We at least know it's a real NFD - now... is it a segment of the root NFD the validator defined ?
      assert(
        btoi(AppID.fromUint64(userOfferedNFDAppID).globalState('i.parentAppID') as bytes) ===
          config.entryGatingAssets[0],
        'specified nfd must be a segment of the nfd the validator specified as a requirement'
      );
    }
  }

  /**
   * Checks if the given NFD App id is valid.  Using only the App id there's no validation against the name (ie: that nfd X is name Y)
   * So it's assumed for the caller, the app id alone is fine.  The name is fetched from the specified app id and the two
   * together are used for validity check call to the nfd registry.
   *
   * @param {uint64} nfdAppID - The NFD App id to verify.
   *
   * @returns {boolean} - Returns true if the NFD App id is valid, otherwise false.
   */
  private isNFDAppIDValid(nfdAppID: uint64): boolean {
    // verify NFD user wants to offer up for testing is at least 'real' - since we just have app id - fetch its name then do is valid call
    const userOfferedNFDName = AppID.fromUint64(nfdAppID).globalState('i.name') as string;

    sendAppCall({
      applicationID: AppID.fromUint64(this.nfdRegistryAppId),
      applicationArgs: ['is_valid_nfd_appid', userOfferedNFDName, itob(nfdAppID)],
      applications: [AppID.fromUint64(nfdAppID)],
    });
    return btoi(this.itxn.lastLog) === 1;
  }

  /**
   * Checks if the specified address is present in an NFDs list of verified addresses.
   * The NFD is assumed to have already been validated as official.
   *
   * @param {uint64} nfdAppID - The NFD application id.
   * @param {Address} addrToFind - The address to find in the v.caAlgo.0.as property
   * @return {boolean} - `true` if the address is present, `false` otherwise.
   */
  private isAddressInNFDCAAlgoList(nfdAppID: uint64, addrToFind: Address): boolean {
    sendAppCall({
      applicationID: AppID.fromUint64(nfdAppID),
      applicationArgs: ['read_property', 'v.caAlgo.0.as'],
    });
    const caAlgoData = this.itxn.lastLog;
    for (let i = 0; i < caAlgoData.length; i += 32) {
      const addr = extract3(caAlgoData, i, 32);
      if (addr !== rawBytes(globals.zeroAddress) && addr === rawBytes(addrToFind)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the maximum allowed stake per validator based on a percentage of all current online stake before
   * the validator is considered saturated - where rewards are diminished.
   * NOTE: this function is defined twice - here and in staking pool contract.  Both must be identical.
   */
  private algoSaturationLevel(): uint64 {
    const online = this.getCurrentOnlineStake();

    return wideRatio([online, MAX_VALIDATOR_SOFT_PCT_OF_ONLINE_1DECIMAL], [1000]);
  }

  /**
   * Returns the MAXIMUM allowed stake per validator based on a percentage of all current online stake.
   * Adding stake is completely blocked at this amount.
   */
  private maxAllowedStake(): uint64 {
    const online = this.getCurrentOnlineStake();

    return wideRatio([online, MAX_VALIDATOR_HARD_PCT_OF_ONLINE_1DECIMAL], [1000]);
  }

  /**
   * Returns the MAXIMUM allowed stake per pool and still receive incentives - we'll treat this as the 'max per pool'
   */
  private maxAlgoAllowedPerPool(): uint64 {
    // TODO replace w/ appropriate AVM call once available
    return 70_000_000_000_000; // 70m ALGO in microAlgo
  }

  private getCurrentOnlineStake(): uint64 {
    // TODO - replace w/ appropriate AVM call once available but return fixed 2 billion for now.
    return 2_000_000_000_000_000;
  }

  private minBalanceForAccount(
    contracts: uint64,
    extraPages: uint64,
    assets: uint64,
    localInts: uint64,
    localBytes: uint64,
    globalInts: uint64,
    globalBytes: uint64
  ): uint64 {
    let minBal = ALGORAND_ACCOUNT_MIN_BALANCE;
    minBal += contracts * APPLICATION_BASE_FEE;
    minBal += extraPages * APPLICATION_BASE_FEE;
    minBal += assets * ASSET_HOLDING_FEE;
    minBal += localInts * SSC_VALUE_UINT;
    minBal += globalInts * SSC_VALUE_UINT;
    minBal += localBytes * SSC_VALUE_BYTES;
    minBal += globalBytes * SSC_VALUE_BYTES;
    return minBal;
  }

  private costForBoxStorage(totalNumBytes: uint64): uint64 {
    const SCBOX_PERBOX = 2500;
    const SCBOX_PERBYTE = 400;

    return SCBOX_PERBOX + totalNumBytes * SCBOX_PERBYTE;
  }
}
