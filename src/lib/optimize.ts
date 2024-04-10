import * as ts from 'ts-morph';
import langspec from '../static/langspec.json';

type NodeAndTEAL = {
  node: ts.Node;
  teal: string;
};

const MAX_UINT64 = BigInt('0xFFFFFFFFFFFFFFFF');

const arglessOps = langspec.Ops.filter((op) => op.Args === undefined && op.Returns !== undefined);
const arglessOpNames = ['byte', 'int', 'addr', ...arglessOps.map((op) => op.Name)];

export function optimizeFrames(inputTeal: NodeAndTEAL[]) {
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
      } else if (outputTeal[i - 1].teal.match(/^(byte|int)/)) {
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

      if (frames[protoIndex][frameIndex] && !frames[protoIndex][frameIndex].hasWrite) {
        const comment = teal.split(' ').slice(2).join(' ');
        const f = frames[protoIndex][frameIndex];
        outputTeal[i].teal = outputTeal[i].teal.replace(teal, `${f.lineBefore} ${comment}`);
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
export function optimizeOpcodes(inputTeal: NodeAndTEAL[]): NodeAndTEAL[] {
  const outputTeal: NodeAndTEAL[] = [];

  const popTeal = () => {
    outputTeal.pop();
  };

  const pushTeal = (teal: string, node: ts.Node) => {
    outputTeal.push({ teal, node });
  };

  inputTeal.forEach((nodeAndTeal) => {
    let optimized = false;

    const teal = nodeAndTeal.teal.trim();
    const { node } = nodeAndTeal;

    // gitxn with one immediate arg is not an actual op but TEALScript pretends it is to make life easier
    if (teal.startsWith('gitxn ') && teal.split(' ').length < 3) {
      const index = Number(outputTeal.at(-1)!.teal.split(' ')[1]);
      popTeal();
      const gitxnField = teal.split(' ')[1];
      pushTeal(`gitxn ${index} ${gitxnField}`, node);
      optimized = true;
    } else if (teal.startsWith('replace3')) {
      if (outputTeal.at(-1)?.teal.startsWith('byte 0x') && outputTeal.at(-2)?.teal.startsWith('int ')) {
        const bytes = outputTeal.at(-1)!;
        const start = parseInt(outputTeal.at(-2)!.teal.split(' ')[1].replace('_', ''), 10);

        popTeal();
        popTeal();
        pushTeal(bytes.teal, bytes.node);
        pushTeal(`replace2 ${start}`, node);

        optimized = true;
      }
    } else if (teal.startsWith('gloadss')) {
      if (outputTeal.at(-1)?.teal.startsWith('int ')) {
        const scratchSlot = Number(outputTeal.at(-1)?.teal.split(' ')[1]);
        popTeal();
        pushTeal(`gloads ${scratchSlot}`, node);
        optimized = true;
      }
    } else if (teal.startsWith('gloads')) {
      if (outputTeal.at(-1)?.teal.startsWith('int ')) {
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
      if (['byte', 'pushbyte'].includes(a?.teal.split(' ')[0] ?? '')) {
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

      if (aLine?.startsWith('int ') && bLine?.startsWith('int ')) {
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

      if (aLine?.startsWith('int ') && bLine?.startsWith('int ')) {
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
      if (outputTeal.at(-1)?.teal.startsWith('int ')) {
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
    } else if (teal.startsWith('+') || teal.startsWith('-') || teal.startsWith('*') || teal.startsWith('/')) {
      const aLine = outputTeal.at(-2)?.teal;
      const bLine = outputTeal.at(-1)?.teal;

      if (aLine?.startsWith('int ') && bLine?.startsWith('int ')) {
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
        optimized = true;

        outputTeal.forEach((t) => {
          if (t.teal.startsWith(`b ${branchName}`)) {
            // eslint-disable-next-line no-param-reassign
            t.teal = 'retsub';
          }
        });
      }
    }

    if (!optimized) pushTeal(teal, node);
  });

  return outputTeal;
}
/** optimizeOpcodes will undo dup opcodes and do multiple pushes of the literal value. This function takes multiple literals and replaces it with the dup/dupn opcode */
function deDupTeal(inputTeal: NodeAndTEAL[]) {
  const newTeal: NodeAndTEAL[] = [];
  const oldTeal: NodeAndTEAL[] = inputTeal.slice();

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
export function rmUnusedLabels(inputTeal: NodeAndTEAL[]) {
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

export function optimizeTeal(inputTeal: NodeAndTEAL[]) {
  let newTeal: NodeAndTEAL[] = inputTeal.slice();
  let oldTeal: NodeAndTEAL[] = inputTeal.slice();

  do {
    oldTeal = newTeal.slice();

    // it's important to optimize frames first to gitxn works properly
    newTeal = optimizeFrames(newTeal);
    newTeal = optimizeOpcodes(newTeal);
  } while (JSON.stringify(newTeal.map((t) => t.teal)) !== JSON.stringify(oldTeal.map((t) => t.teal)));

  return deDupTeal(newTeal);
}
