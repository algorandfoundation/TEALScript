import langspec from '../langspec.json';

const MAX_UINT64 = BigInt('0xFFFFFFFFFFFFFFFF');

const arglessOps = langspec.Ops.filter((op) => op.Args === undefined && op.Returns !== undefined);
const arglessOpNames = ['byte', 'int', 'addr', ...arglessOps.map((op) => op.Name)];

export function optimizeFrames(inputTeal: string[]) {
  const outputTeal = inputTeal.slice();

  const frames: {[frameIndex: string]: {
        lineBefore: string
        hasWrite: boolean
        reads: number
        line: string
      }}[] = [];

  let protoIndex = -1;
  outputTeal.map((t) => t.trim()).forEach((t, i) => {
    if (t.startsWith('proto')) {
      protoIndex += 1;
      frames[protoIndex] = {};
      return;
    }
    if (t.startsWith('frame_bury')) {
      const frameIndex = t.split(' ')[1];

      if (frames[protoIndex][frameIndex]) {
        frames[protoIndex][frameIndex].hasWrite = true;
      } else if (outputTeal[i - 1].match(/^(byte|int)/)) {
        frames[protoIndex][frameIndex] = {
          lineBefore: outputTeal[i - 1],
          hasWrite: false,
          reads: 0,
          line: t,
        };
      }
      return;
    }

    if (t.startsWith('frame_dig')) {
      const frameIndex = t.split(' ')[1];

      if (frames[protoIndex][frameIndex]) {
        frames[protoIndex][frameIndex].reads += 1;
      }
    }
  });

  protoIndex = -1;
  outputTeal.map((t) => t.trim()).forEach((t, i) => {
    if (t.startsWith('proto')) {
      protoIndex += 1;
      return;
    }

    if (t.startsWith('frame_dig')) {
      const frameIndex = t.split(' ')[1];

      if (frames[protoIndex][frameIndex] && !frames[protoIndex][frameIndex].hasWrite) {
        const comment = t.split(' ').slice(2).join(' ');
        const f = frames[protoIndex][frameIndex];
        outputTeal[i] = outputTeal[i].replace(t, `${f.lineBefore} ${comment}`);
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
export function optimizeOpcodes(inputTeal: string[]) {
  const outputTeal: string[] = [];

  const popTeal = () => {
    outputTeal.pop();
  };

  const pushTeal = (teal: string) => {
    outputTeal.push(teal);
  };

  inputTeal.forEach((teal) => {
    let optimized = false;

    if (teal.startsWith('len')) {
      if (outputTeal.at(-1)?.startsWith('byte 0x')) {
        const bytes = outputTeal.at(-1)!.split(' ')[1].slice(2);
        popTeal();
        pushTeal(`int ${bytes.length / 2}`);
        optimized = true;
      }
    } else if (teal.startsWith('dup')) {
      const a = outputTeal.at(-1);
      if (['byte', 'pushbyte'].includes(a?.split(' ')[0] ?? '')) {
        const times = teal.startsWith('dupn ') ? Number(teal.split(' ')[1]) : 1;

        for (let i = 0; i < times; i += 1) {
          pushTeal(a!);
        }
        optimized = true;
      }
    } else if (teal.startsWith('swap')) {
      const b = outputTeal.at(-1)!;
      const a = outputTeal.at(-2)!;

      if (arglessOpNames.includes(a.split(' ')[0]) && arglessOpNames.includes(b.split(' ')[0])) {
        popTeal();
        popTeal();

        pushTeal(b);
        pushTeal(a);

        optimized = true;
      }
    } else if (teal.startsWith('extract ') && outputTeal.at(-1)?.startsWith('byte 0x')) {
      const bytes = outputTeal.at(-1)!.split(' ')[1].slice(2);

      const start = Number(teal.split(' ')[1]);
      const length = Number(teal.split(' ')[2]);

      popTeal();
      pushTeal(`byte 0x${bytes.slice(start * 2, start * 2 + length * 2)}`);
      optimized = true;
    } else if (teal.startsWith('extract3')) {
      const aLine = outputTeal.at(-2);
      const bLine = outputTeal.at(-1);

      if (aLine?.startsWith('int ') && bLine?.startsWith('int ')) {
        const a = BigInt(aLine.split(' ')[1].replace('_', ''));
        const b = BigInt(bLine.split(' ')[1].replace('_', ''));

        if (a < 256 && b < 256) {
          popTeal();
          popTeal();

          pushTeal(`extract ${a} ${b}`);

          optimized = true;
        }
      }
    } else if (teal.startsWith('btoi')) {
      if (outputTeal.at(-1)?.startsWith('byte 0x')) {
        const hexBytes = outputTeal.at(-1)!.split(' ')[1].slice(2);

        const val = BigInt(`0x${hexBytes}`);

        if (val > MAX_UINT64) {
          throw Error(`Value too large for btoi: ${val}`);
        }

        popTeal();

        pushTeal(`int ${val}`);

        optimized = true;
      }
    } else if (teal.startsWith('itob')) {
      if (outputTeal.at(-1)?.startsWith('int ')) {
        const n = BigInt(outputTeal.at(-1)!.split(' ')[1]);
        popTeal();

        pushTeal(`byte 0x${n.toString(16).padStart(16, '0')}`);

        optimized = true;
      }
    } else if (teal.startsWith('concat')) {
      const b = outputTeal.at(-1);
      const a = outputTeal.at(-2);

      if (a?.startsWith('byte 0x') && b?.startsWith('byte 0x')) {
        const aBytes = a.split(' ')[1].slice(2);
        const bBytes = b.split(' ')[1].slice(2);

        popTeal();
        popTeal();

        pushTeal(`byte 0x${aBytes}${bBytes}`);

        optimized = true;
      }
    } else if (teal.startsWith('byte 0x')) {
      const b = outputTeal.at(-1);
      const a = outputTeal.at(-2);

      if (a?.startsWith('byte 0x') && b?.startsWith('concat')) {
        const aBytes = a.split(' ')[1].slice(2);
        const bBytes = teal.split(' ')[1].slice(2);

        popTeal();
        popTeal();

        pushTeal(`byte 0x${aBytes}${bBytes}`);

        optimized = true;
      }
    } else if (teal.startsWith('+') || teal.startsWith('-') || teal.startsWith('*') || teal.startsWith('/')) {
      const aLine = outputTeal.at(-2);
      const bLine = outputTeal.at(-1);

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
          pushTeal(`int ${val}`);
          optimized = true;
        }
      }
    }

    if (!optimized) pushTeal(teal);
  });

  return outputTeal;
}

export function optimizeTeal(inputTeal: string[]) {
  let newTeal: string[] = inputTeal.slice();
  let oldTeal: string[] = inputTeal.slice();

  do {
    oldTeal = newTeal.slice();
    newTeal = optimizeOpcodes(newTeal);
    newTeal = optimizeFrames(newTeal);
  } while (JSON.stringify(newTeal) !== JSON.stringify(oldTeal));

  return newTeal;
}
