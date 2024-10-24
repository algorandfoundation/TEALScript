import * as ts from 'ts-morph';
import base32 from 'hi-base32';
// eslint-disable-next-line camelcase
import { sha512_256 } from 'js-sha512';
import langspec from '../static/langspec.json';

type TEALInfo = {
  node: ts.Node;
  teal: string;
  errorMessage?: string;
};

const MAX_UINT64 = BigInt('0xFFFFFFFFFFFFFFFF');
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;

const arglessOps = langspec.Ops.filter((op) => op.Args === undefined && op.Returns !== undefined);
const arglessOpNames = ['byte', 'int', 'addr', ...arglessOps.map((op) => op.Name)];

// def decode_address(addr):
//     """
//     Decode a string address into its address bytes and checksum.

//     Args:
//         addr (str): base32 address

//     Returns:
//         bytes: address decoded into bytes

//     """
//     if not addr:
//         return addr
//     if not len(addr) == constants.address_len:
//         raise error.WrongKeyLengthError
//     decoded = base64.b32decode(_correct_padding(addr))
//     pubkey = decoded[: -constants.check_sum_len_bytes]
//     expected_checksum = decoded[-constants.check_sum_len_bytes :]
//     chksum = _checksum(pubkey)

//     if chksum == expected_checksum:
//         return pubkey
function decodeAddress(address: string) {
  if (address.length !== 58) {
    throw Error(`Wrong address length: ${address}`);
  }

  const decoded = base32.decode.asBytes(address);
  const pubkey = decoded.slice(0, -ALGORAND_CHECKSUM_BYTE_LENGTH);
  return Buffer.from(pubkey).toString('hex');
}

export function optimizeFrames(inputTeal: TEALInfo[]) {
  const outputTeal = inputTeal.slice();

  const frames: {
    [frameIndex: string]: {
      lineBefore: string;
      hasWrite: boolean;
      reads: number;
      line: string;
    };
  }[] = [];

  let protoIndex = -1;
  outputTeal.forEach((t, i) => {
    const { teal } = t;

    if (teal.startsWith('proto')) {
      protoIndex += 1;
      frames[protoIndex] = {};
      return;
    }
    if (teal.startsWith('frame_bury')) {
      const frameIndex = teal.split(' ')[1];

      if (frames[protoIndex][frameIndex]) {
        frames[protoIndex][frameIndex].hasWrite = true;
      } else {
        frames[protoIndex][frameIndex] = {
          lineBefore: outputTeal[i - 1].teal,
          hasWrite: false,
          reads: 0,
          line: teal,
        };
      }
      return;
    }

    if (teal.startsWith('frame_dig')) {
      const frameIndex = teal.split(' ')[1];

      if (frames[protoIndex][frameIndex]) {
        frames[protoIndex][frameIndex].reads += 1;
      } else {
        frames[protoIndex][frameIndex] = {
          lineBefore: '',
          hasWrite: true,
          reads: 0,
          line: '',
        };
      }
    }
  });

  protoIndex = -1;
  outputTeal.forEach((t, i) => {
    const { teal } = t;
    if (teal.startsWith('proto')) {
      protoIndex += 1;
      return;
    }

    if (teal.startsWith('frame_dig')) {
      const frameIndex = teal.split(' ')[1];
      const frame = frames[protoIndex][frameIndex];

      if (frame && !frame.hasWrite && frame.lineBefore.match(/^(byte|int)/)) {
        const comment = teal.split(' ').slice(2).join(' ');
        outputTeal[i].teal = outputTeal[i].teal.replace(teal, `${frame.lineBefore} ${comment}`);
      }
    }
  });

  return outputTeal;
}
/*
TODO:
  optimize replace2
  optimize byte math
  optimize bitlen (Math.floor((Math.log(n) / Math.log(2)))
*/
export function optimizeOpcodes(inputTeal: TEALInfo[]): TEALInfo[] {
  const outputTeal: TEALInfo[] = [];

  const popTeal = () => {
    outputTeal.pop();
  };

  const pushTeal = (teal: string, node: ts.Node, errorMessage?: string) => {
    outputTeal.push({ teal, node, errorMessage });
  };

  inputTeal.forEach((tealInfo) => {
    let optimized = false;

    const teal = tealInfo.teal.trim();
    const { node, errorMessage } = tealInfo;

    // gitxn with one immediate arg is not an actual op but TEALScript pretends it is to make life easier
    if (teal.startsWith('gitxn ') && teal.split(' ').length < 3) {
      const index = Number(outputTeal.at(-1)!.teal.split(' ')[1]);
      popTeal();
      const gitxnField = teal.split(' ')[1];
      pushTeal(`gitxn ${index} ${gitxnField}`, node);
      optimized = true;
    } else if (teal.startsWith('replace3')) {
      if (outputTeal.at(-1)?.teal.startsWith('byte 0x') && outputTeal.at(-2)?.teal.match(/^int \d/)) {
        const bytes = outputTeal.at(-1)!;
        const start = parseInt(outputTeal.at(-2)!.teal.split(' ')[1].replace('_', ''), 10);

        popTeal();
        popTeal();
        pushTeal(bytes.teal, bytes.node);
        pushTeal(`replace2 ${start}`, node);

        optimized = true;
      }
    } else if (teal.startsWith('gloadss')) {
      if (outputTeal.at(-1)?.teal.match(/^int \d/)) {
        const scratchSlot = Number(outputTeal.at(-1)?.teal.split(' ')[1]);
        popTeal();
        pushTeal(`gloads ${scratchSlot}`, node);
        optimized = true;
      }
    } else if (teal.startsWith('gloads')) {
      if (outputTeal.at(-1)?.teal.match(/^int \d/)) {
        const scratchSlot = Number(teal.split(' ')[1]);
        const txnIndex = Number(outputTeal.at(-1)?.teal.split(' ')[1]);

        popTeal();
        pushTeal(`gload ${txnIndex} ${scratchSlot}`, node);
        optimized = true;
      }
    } else if (teal.startsWith('cover ')) {
      const n = Number(teal.split(' ')[1]);
      const movedTeal = outputTeal.slice(-n - 1, -1);

      let argOps = false;
      const targetTeal = outputTeal.at(-1)!;
      [targetTeal, ...movedTeal].forEach((t) => {
        const op = t.teal.split(' ')[0];
        if (!arglessOpNames.includes(op)) argOps = true;
      });

      if (!argOps) {
        popTeal();
        movedTeal.forEach(() => popTeal());
        pushTeal(targetTeal.teal, node);
        movedTeal.forEach((t) => pushTeal(t.teal, node));

        // outputTeal.splice(-n, n);
        // outputTeal.push(...movedTeal);
        optimized = true;
      }
    } else if (teal.startsWith('len')) {
      if (outputTeal.at(-1)?.teal.startsWith('byte 0x')) {
        const bytes = outputTeal.at(-1)!.teal.split(' ')[1].slice(2);
        popTeal();
        pushTeal(`int ${bytes.length / 2}`, node);
        optimized = true;
      }
    } else if (teal.startsWith('dup')) {
      const a = outputTeal.at(-1);
      if (['byte', 'pushbytes'].includes(a?.teal.split(' ')[0] ?? '')) {
        const times = teal.startsWith('dupn ') ? Number(teal.split(' ')[1]) : 1;

        for (let i = 0; i < times; i += 1) {
          pushTeal(a!.teal, node);
        }
        optimized = true;
      }
    } else if (teal.startsWith('swap')) {
      const b = outputTeal.at(-1)!;
      const a = outputTeal.at(-2)!;

      if (arglessOpNames.includes(a.teal.split(' ')[0]) && arglessOpNames.includes(b.teal.split(' ')[0])) {
        popTeal();
        popTeal();

        pushTeal(b.teal, node);
        pushTeal(a.teal, node);

        optimized = true;
      }
    } else if (teal.startsWith('extract ')) {
      const lastLine = outputTeal.at(-1)?.teal;

      const start = Number(teal.split(' ')[1]);
      const length = Number(teal.split(' ')[2]);

      if (lastLine?.startsWith('byte 0x')) {
        const bytes = outputTeal.at(-1)!.teal.split(' ')[1].slice(2);

        popTeal();
        pushTeal(`byte 0x${bytes.slice(start * 2, start * 2 + length * 2)}`, node);
        optimized = true;
      } else if (lastLine?.startsWith('assert') && outputTeal.at(-2)?.teal.startsWith('box_get')) {
        popTeal();
        popTeal();
        pushTeal(`int ${start}`, node);
        pushTeal(`int ${length}`, node);
        pushTeal('box_extract', node);
        optimized = true;
      }
    } else if (teal.startsWith('substring ') && outputTeal.at(-1)?.teal.startsWith('byte 0x')) {
      const bytes = outputTeal.at(-1)!.teal.split(' ')[1].slice(2);

      const start = Number(teal.split(' ')[1]);
      const end = Number(teal.split(' ')[2]);

      popTeal();
      pushTeal(`byte 0x${bytes.slice(start * 2, end * 2)}`, node);
      optimized = true;
    } else if (teal.startsWith('extract3')) {
      const aLine = outputTeal.at(-2)?.teal;
      const bLine = outputTeal.at(-1)?.teal;

      if (aLine?.match(/^int \d/) && bLine?.match(/^int \d/)) {
        const a = BigInt(aLine.split(' ')[1].replace('_', ''));
        const b = BigInt(bLine.split(' ')[1].replace('_', ''));

        if (a < 256 && b < 256) {
          popTeal();
          popTeal();

          pushTeal(`extract ${a} ${b}`, node);

          optimized = true;
        }
      }
    } else if (teal.startsWith('substring3')) {
      const aLine = outputTeal.at(-2)?.teal;
      const bLine = outputTeal.at(-1)?.teal;

      if (aLine?.match(/^int \d/) && bLine?.match(/^int \d/)) {
        const a = BigInt(aLine.split(' ')[1].replace('_', ''));
        const b = BigInt(bLine.split(' ')[1].replace('_', ''));

        if (a < 256 && b < 256) {
          popTeal();
          popTeal();

          pushTeal(`substring ${a} ${b}`, node);

          optimized = true;
        }
      }
    } else if (teal.startsWith('btoi')) {
      if (outputTeal.at(-1)?.teal.startsWith('byte 0x')) {
        const hexBytes = outputTeal.at(-1)!.teal.split(' ')[1].slice(2);

        const val = BigInt(`0x${hexBytes}`);

        if (val > MAX_UINT64) {
          throw Error(`Value too large for btoi: ${val}`);
        }

        popTeal();

        pushTeal(`int ${val}`, node);

        optimized = true;
      }
    } else if (teal.startsWith('itob')) {
      if (outputTeal.at(-1)?.teal.match(/^int \d/)) {
        const intStr = outputTeal.at(-1)!.teal.split(' ')[1].replace(/_/g, '');
        const n = BigInt(intStr);
        popTeal();

        pushTeal(`byte 0x${n.toString(16).padStart(16, '0')}`, node);

        optimized = true;
      }
    } else if (teal.startsWith('concat')) {
      const b = outputTeal.at(-1)?.teal;
      const a = outputTeal.at(-2)?.teal;

      if (a?.startsWith('byte 0x') && b?.startsWith('byte 0x')) {
        const aBytes = a.split(' ')[1].slice(2);
        const bBytes = b.split(' ')[1].slice(2);

        popTeal();
        popTeal();

        pushTeal(`byte 0x${aBytes}${bBytes}`, node);

        optimized = true;
      }
    } else if (
      teal.startsWith('+') ||
      teal.startsWith('-') ||
      teal.startsWith('*') ||
      (teal.startsWith('/') && !teal.startsWith('//'))
    ) {
      const aLine = outputTeal.at(-2)?.teal;
      const bLine = outputTeal.at(-1)?.teal;

      if (aLine?.match(/^int \d/) && bLine?.match(/^int \d/)) {
        const a = BigInt(aLine.split(' ')[1].replace('_', ''));
        const b = BigInt(bLine.split(' ')[1].replace('_', ''));

        let val: bigint;

        switch (teal.split(' ')[0]) {
          case '+':
            val = a + b;
            break;
          case '-':
            val = a - b;
            break;
          case '*':
            val = a * b;
            break;
          case '/':
            val = a / b;
            break;
          default:
            throw Error(`Unknown operator: ${teal}`);
        }

        if (val <= MAX_UINT64) {
          popTeal();
          popTeal();
          pushTeal(`int ${val}`, node);
          optimized = true;
        }
      }
    } else if (teal.startsWith('retsub')) {
      if (outputTeal.at(-1)?.teal.endsWith('*return:')) {
        const lastLine = outputTeal.at(-1)!.teal;

        const branchName = lastLine.slice(0, lastLine.length - 1);
        popTeal();

        outputTeal.forEach((t) => {
          if (t.teal.startsWith(`b ${branchName}`)) {
            // eslint-disable-next-line no-param-reassign
            t.teal = 'retsub';
          }
        });
      }
    }

    if (!optimized) pushTeal(teal, node, errorMessage);
  });

  return outputTeal;
}
/** optimizeOpcodes will undo dup opcodes and do multiple pushes of the literal value. This function takes multiple literals and replaces it with the dup/dupn opcode */
function deDupTeal(inputTeal: TEALInfo[]) {
  const newTeal: TEALInfo[] = [];
  const oldTeal: TEALInfo[] = inputTeal.slice();

  let count = 1;

  oldTeal.forEach((currentNodeAndTeal) => {
    const currentLine = currentNodeAndTeal.teal;
    const lastLine = newTeal.at(-1)?.teal;
    const isDupable = currentLine.match(/^(byte|int)/);

    if (isDupable && currentLine === lastLine) {
      count += 1;
    } else {
      if (count > 1) {
        if (count === 2) newTeal.push({ teal: 'dup', node: newTeal.at(-1)!.node });
        else newTeal.push({ teal: `dupn ${count - 1}`, node: newTeal.at(-1)!.node });
      }
      newTeal.push(currentNodeAndTeal);
      count = 1;
    }
  });

  return newTeal;
}

/**
 * Remove unused labels from TEAL code
 * I started implementing this then realized labels are kinda nice for readability so I kept them in
 */
export function rmUnusedLabels(inputTeal: TEALInfo[]) {
  const teal = inputTeal.map((t) => t.teal);
  const labels = teal.filter((t) => t.match(/^\S+:/)).map((t) => t.split(':')[0]);

  const unusedLabels = labels.filter((label) => {
    return (
      !label.startsWith('*abi_route') &&
      !label.startsWith('*call_') &&
      !label.startsWith('*create_') &&
      label !== '*NOT_IMPLEMENTED' &&
      !teal.some((t) => {
        const branchOps = ['b', 'bz', 'bnz', 'callsub'];

        const isBranchOp = branchOps.includes(t.split(' ')[0]);
        return isBranchOp && t.split(' ')[1] === label;
      })
    );
  });

  return inputTeal.filter((t) => {
    const currentLabel = t.teal.split(':')[0];
    return !unusedLabels.includes(currentLabel);
  });
}

function constantBlocks(inputTeal: TEALInfo[]): TEALInfo[] {
  let newTeal: TEALInfo[] = inputTeal.slice();

  let bytecblock = new Set<string>();
  let intcblock = new Set<string>();

  // first find TMPL variables and add them to constant blocks because they MUST be in the constant block
  inputTeal.forEach((t) => {
    const { teal } = t;

    if (teal.startsWith('byte ')) {
      const value = teal.split(' ')[1];
      if (value.startsWith('TMPL_')) bytecblock.add(value);
    }

    if (teal.startsWith('int ')) {
      const value = teal.split(' ')[1];
      if (value.startsWith('TMPL_')) intcblock.add(value);
    }
  });

  const intEnums: Record<string, string> = {
    unknown: '0',
    pay: '1',
    keyreg: '2',
    acfg: '3',
    axfer: '4',
    afrz: '5',
    appl: '6',
    NoOp: '0',
    OptIn: '1',
    CloseOut: '2',
    ClearState: '3',
    UpdateApplication: '4',
    DeleteApplication: '5',
  };

  newTeal = newTeal.map((t) => {
    if (t.teal.startsWith('method ')) {
      const signature = t.teal.split('"')[1];
      const selector = sha512_256(Buffer.from(signature)).slice(0, 8);
      return { teal: `byte 0x${selector} // method "${signature}"`, node: t.node };
    }

    if (t.teal.startsWith('addr ')) {
      const address = t.teal.split(' ')[1];
      const decoded = decodeAddress(address);
      return { teal: `byte 0x${decoded} // addr "${address}"`, node: t.node };
    }

    if (t.teal.startsWith('int ')) {
      let arg = t.teal.split(' ')[1];
      if (intEnums[arg]) {
        arg = `${intEnums[arg]} // ${arg}`;

        return { teal: `int ${arg}`, node: t.node };
      }
    }

    return t;
  });

  const byteValues: Record<string, { count: number; size: number; isTmpl: boolean }> = {};
  const intValues: Record<string, { count: number; size: number; isTmpl: boolean }> = {};

  const numberOfBytes = (n: bigint) => {
    return Math.ceil(n.toString(2).length / 8) || 1;
  };

  newTeal.forEach((t) => {
    if (t.teal.startsWith('byte ')) {
      const value = t.teal.split(' ')[1];
      if (byteValues[value]) byteValues[value].count += 1;
      else byteValues[value] = { count: 1, size: value.length, isTmpl: value.startsWith('TMPL_') };
    }

    if (t.teal.startsWith('int ')) {
      const value = t.teal.split(' ')[1];
      if (intValues[value]) intValues[value].count += 1;
      else {
        intValues[value] = {
          count: 1,
          // Size doesn't matter for TMPL values because they are already guranteed to be in the constant block
          size: value.startsWith('TMPL_') ? 8 : numberOfBytes(BigInt(value.replace(/_/g, ''))),
          isTmpl: value.startsWith('TMPL_'),
        };
      }
    }
  });

  // Delete values that only occur once
  Object.entries(byteValues).forEach(([value, info]) => {
    if (info.count === 1 && !info.isTmpl) delete byteValues[value];
  });

  Object.entries(intValues).forEach(([value, info]) => {
    if (info.count === 1 && !info.isTmpl) delete intValues[value];
  });

  // First sort by size * count to determine the 255 values that should go in the block
  const sortedByteValues = Object.entries(byteValues)
    .sort((a, b) => b[1].size * b[1].count - a[1].size * a[1].count)
    .map(([value]) => value);

  const sortedIntValues = Object.entries(intValues)
    .sort((a, b) => b[1].size * b[1].count - a[1].size * a[1].count)
    .map(([value]) => value);

  while (bytecblock.size < 255 && sortedByteValues.length > 0) {
    bytecblock.add(sortedByteValues.shift()!);
  }

  while (intcblock.size < 255 && sortedIntValues.length > 0) {
    intcblock.add(sortedIntValues.shift()!);
  }

  // Then sort by count, so the most used values comes first and can leverage intc_n and bytec_n opcodes
  bytecblock = new Set(Array.from(bytecblock).sort((a, b) => byteValues[b].count - byteValues[a].count));
  intcblock = new Set(Array.from(intcblock).sort((a, b) => intValues[b].count - intValues[a].count));

  newTeal = newTeal.map((t) => {
    if (t.teal.startsWith('byte ')) {
      const value = t.teal.split(' ')[1];
      const comment = t.teal.split(' //')[1];

      if (bytecblock.has(value)) {
        const index = Array.from(bytecblock).indexOf(value);
        return { teal: `bytec ${index} // ${comment || value}`, node: t.node };
      }

      return { teal: t.teal.replace('byte', 'pushbytes'), node: t.node };
    }

    if (t.teal.startsWith('int ')) {
      const value = t.teal.split(' ')[1];
      const comment = t.teal.split(' //')[1];

      if (intcblock.has(value)) {
        const index = Array.from(intcblock).indexOf(value);
        return { teal: `intc ${index} // ${comment || value}`, node: t.node };
      }
      return { teal: t.teal.replace('int', 'pushint'), node: t.node };
    }

    return t;
  });

  // Insert bytecblock before the first non-comment line
  const firstNonCommentLine = newTeal.findIndex((t) => !t.teal.startsWith('//') && !t.teal.startsWith('#'));

  if (bytecblock.size > 0) {
    newTeal.splice(firstNonCommentLine, 0, {
      teal: `bytecblock ${Array.from(bytecblock).join(' ')}`,
      node: newTeal[0].node,
    });
  }

  if (intcblock.size > 0) {
    newTeal.splice(firstNonCommentLine, 0, {
      teal: `intcblock ${Array.from(intcblock).join(' ')}`,
      node: newTeal[0].node,
    });
  }

  return newTeal;
}

export function optimizeTeal(inputTeal: TEALInfo[]) {
  let newTeal: TEALInfo[] = inputTeal.slice();
  let oldTeal: TEALInfo[] = inputTeal.slice();

  do {
    oldTeal = newTeal.slice();

    // it's important to optimize frames first to gitxn works properly
    newTeal = optimizeFrames(newTeal);
    newTeal = optimizeOpcodes(newTeal);
  } while (JSON.stringify(newTeal.map((t) => t.teal)) !== JSON.stringify(oldTeal.map((t) => t.teal)));

  newTeal = constantBlocks(newTeal);

  return deDupTeal(newTeal);
}
