import * as ts from 'typescript';
import langspec from '../langspec.json';

type NodeAndTEAL = {
  node: ts.Node
  teal: string
}

const MAX_UINT64 = BigInt('0xFFFFFFFFFFFFFFFF');

const arglessOps = langspec.Ops.filter((op) => op.Args === undefined && op.Returns !== undefined);
const arglessOpNames = ['byte', 'int', 'addr', ...arglessOps.map((op) => op.Name)];

export function optimizeFrames(inputTeal: NodeAndTEAL[]) {
  const outputTeal = inputTeal.slice();

  const frames: {[frameIndex: string]: {
        lineBefore: string
        hasWrite: boolean
        reads: number
        line: string
      }}[] = [];

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

    if (teal.startsWith('cover ')) {
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
    } else if (teal.startsWith('extract ') && outputTeal.at(-1)?.teal.startsWith('byte 0x')) {
      const bytes = outputTeal.at(-1)!.teal.split(' ')[1].slice(2);

      const start = Number(teal.split(' ')[1]);
      const length = Number(teal.split(' ')[2]);

      popTeal();
      pushTeal(`byte 0x${bytes.slice(start * 2, start * 2 + length * 2)}`, node);
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
        const n = BigInt(outputTeal.at(-1)!.teal.split(' ')[1]);
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
    } else if (teal.startsWith('byte 0x')) {
      const b = outputTeal.at(-1)?.teal;
      const a = outputTeal.at(-2)?.teal;

      if (a?.startsWith('byte 0x') && b?.startsWith('concat')) {
        const aBytes = a.split(' ')[1].slice(2);
        const bBytes = teal.split(' ')[1].slice(2);

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
    }

    if (!optimized) pushTeal(teal, node);
  });

  return outputTeal;
}

export function optimizeTeal(inputTeal: NodeAndTEAL[]) {
  let newTeal: NodeAndTEAL[] = inputTeal.slice();
  let oldTeal: NodeAndTEAL[] = inputTeal.slice();

  do {
    oldTeal = newTeal.slice();
    newTeal = optimizeOpcodes(newTeal);
    newTeal = optimizeFrames(newTeal);
  } while (
    JSON.stringify(newTeal.map((t) => t.teal)) !== JSON.stringify(oldTeal.map((t) => t.teal))
  );

  return newTeal;
}
