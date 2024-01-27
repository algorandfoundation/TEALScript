import { writeFileSync } from 'fs';
import path from 'path';
import langspec from '../src/static/langspec.json';

const lines: string[] = ['# Supported AVM Features', '', '## ARCS'];

const arcs: { arc: number; name: string; desc: string }[] = [
  {
    arc: 4,
    name: 'Application Binary Interface (ABI)	',
    desc: 'ABI method routing is automatically down for public methods. All ABI types are natively supported. Compiler outputs ARC4 JSON',
  },
  {
    arc: 22,
    name: 'Add `read-only` annotation to ABI methods',
    desc: 'Decorating a method with `@abi.readonly` will mark it as readonly',
  },
  {
    arc: 28,
    name: 'Algorand Event Log Spec',
    desc: 'Use `EventLogger` to log ARC28 events',
  },
  {
    arc: 32,
    name: 'Application Specification',
    desc: 'Compiler generates an arc32 JSON file',
  },
];

lines.push('| ARC | Name | Description |');
lines.push('| --- | --- | --- |');
arcs.forEach((arc) => {
  lines.push(`| ${arc.arc} | ${arc.name} | ${arc.desc} |`);
});

lines.push('');

lines.push('## Opcodes');
const ops = {};

let mathOps = ['+', '-', '*', '/', '%', '>', '<', '>=', '<=', '==', '!=', 'sqrt', '|', '&', '^', '~'];
mathOps = [...mathOps, ...mathOps.map((op) => `b${op}`)];
const tealscriptMapping = {
  '`throw Error()`': ['err'],
  'Used automatically in loops and conditionals': ['bnz', 'bz', 'b'],
  'Used when the top-level function returns': ['return'],
  '`assert`': ['assert'],
  'Stack manipulation is not officially supported': [
    'bury',
    'popn',
    'dupn',
    'pop',
    'dup',
    'swap',
    'dup2',
    'dig',
    'cover',
    'uncover',
  ],
  'Used automatically in functions': ['proto', 'frame_dig', 'frame_bury'],
  'Used when calling a function': ['callsub'],
  '`return`': 'retsub',
  'Not officially supported yet, but could be used to optimize conditionals in the future': [
    'switch',
    'match',
    'select',
  ],
  '`sha256`': ['sha256'],
  '`keccak256`': ['keccak256'],
  '`sha512_256`': ['sha512_256'],
  '`ed25519Verify`': ['ed25519verify'],
  '`ed25519VerifyBare`': ['ed25519verify_bare'],
  '`ecdsaVerify`': ['ecdsa_verify'],
  '`ecdsaPkDecompress`': ['ecdsa_pk_decompress'],
  '`ecdsaPkRecover`': ['ecdsa_pk_recover'],
  '`sha3_256`': ['sha3_256'],
  '`vrfVerify`': ['vrf_verify'],
  '`ecAdd`': ['ec_add'],
  '`ecScalarMul`': ['ec_scalar_mul'],
  '`ecPairingCheck`': ['ec_pairing_check'],
  '`ecMultiScalarMul`': ['ec_multi_scalar_mul'],
  '`ecSubgroupCheck`': ['ec_subgroup_check'],
  '`ecMapTo`': ['ec_map_to'],
  'Natively supported': [...mathOps, '&&', '||', '!', 'btoi', 'itob'],
  'Method call on `BoxKey` or `BoxMap`': [
    'box_create',
    'box_extract',
    'box_replace',
    'box_del',
    'box_len',
    'box_get',
    'box_put',
    'box_splice',
    'box_resize',
  ],
  '`this.pendingGroup.add...` or `send...`': ['itxn_begin', 'itxn_field'],
  '`this.pendingGroup.execute` or `send...`': ['itxn_submit'],
  '`this.pendingGroup.add...`': ['itxn_next'],
  '`this.itxn`': ['itxn', 'itxna', 'itxnas'],
  'Method call on `GlobalStateKey` on `GlobalStateMap`': ['app_global_get', 'app_global_put', 'app_global_del'],
  '`AppID.global()`': ['app_global_get_ex'],
  '`globals`': 'global',
  'Method call on LocalStateKey on `LocalStateMap`': ['app_local_get', 'app_local_put', 'app_local_del'],
  '`AppID.local()`': ['app_local_get_ex'],
  '`**`': 'exp',
  '`.length` on bytes': ['len'],
  '`concat` or `+`': 'concat',
  '`String.substring` or `substring`': ['substring', 'substring3'],
  '`extractUint16`': ['extract_uint16'],
  '`extractUint32`': ['extract_uint32'],
  '`extractUint64`': ['extract_uint64'],
  'Constant block not officially supported': [
    'intcblock',
    'intc',
    'intc_0',
    'intc_1',
    'intc_2',
    'intc_3',
    'bytecblock',
    'bytec',
    'bytec_0',
    'bytec_1',
    'bytec_2',
    'bytec_3',
  ],
  '`LogicSig.logic` arguments': ['arg', 'args', 'arg_0', 'arg_1', 'arg_2', 'arg_3'],
  '`this.txn`': ['txn', 'txna', 'txnas'],
  '`ScratchSlot`': ['load', 'store', 'stores', 'loads'],
  '`log` or `EventEmitter`': ['log'],
  '`extract3`': ['extract', 'extract3'],
  '`this.txnGroup` or transaction argument': ['gtxn', 'gtxna', 'gtxns', 'gtxnas', 'gtxnsas', 'gaid', 'gaids', 'gtxnsa'],
  '`Txn.load`': ['gload', 'gloads', 'gloadss'],
  'Used by `TemplateVar`': ['pushbytes', 'pushint'],
  'Not used yet, but could be used for optimizations in future': ['pushbytess', 'pushints'],
  '`bzero`': ['bzero'],
  '`replace3`': ['replace2', 'replace3'],
  '`Address.balance` and `Address.hasBalance`': ['balance'],
  '`Address.isOptedInToApp()`': ['app_opted_in'],
  '`Address.assetBalance` and `Address.hasAsset`': ['asset_holding_get'],
  'Method calls on `AssetID`': ['asset_params_get'],
  'Method calls on `AppID`': ['app_params_get'],
  'Method calls on `Address`': ['acct_params_get'],
  '`Address.minBalance`': ['min_balance'],
  '`this.lastInnerGroup`': ['gitxn', 'gitxna', 'gitxnas'],
};
Object.keys(langspec.Ops).forEach((key) => {
  const group = langspec.Ops[key].Groups[0];

  const name = langspec.Ops[key].Name;

  ops[group] = ops[group] || [];

  ops[group]?.push(name);
});

Object.keys(ops).forEach((group) => {
  lines.push('');
  lines.push(`### ${group}`);
  lines.push('| Opcode | TEALScript |');
  lines.push('| --- | --- |');
  ops[group].forEach((op) => {
    const desc = Object.keys(tealscriptMapping).find((key) => tealscriptMapping[key].includes(op));

    lines.push(`| ${op} | ${desc ?? 'Not yet supported or tested'} |`);
  });
});

writeFileSync(path.join(__dirname, '..', 'FEATURES.md'), lines.join('\n'));
