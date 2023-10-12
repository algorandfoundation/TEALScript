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

      if (frames[protoIndex][frameIndex]) {
        const comment = t.split(' ').slice(2).join(' ');
        const f = frames[protoIndex][frameIndex];
        outputTeal[i] = outputTeal[i].replace(t, `${f.lineBefore} ${comment}`);
      }
    }
  });

  return outputTeal;
}

export function optimizeOpcodes(inputTeal: string[]) {
  const outputTeal: string[] = [];

  const getHexBytes = (bytes: string) => {
    if (bytes.startsWith('"')) return Buffer.from(bytes.slice(1, -1), 'utf8').toString('hex');
    return bytes.slice(2);
  };

  const popTeal = () => {
    outputTeal.pop();
  };

  const pushTeal = (teal: string) => {
    outputTeal.push(teal);
  };

  inputTeal.forEach((teal) => {
    let optimized = false;
    if (teal.startsWith('extract3')) {
      const aLine = outputTeal.at(-2);
      const bLine = outputTeal.at(-1);

      if (aLine?.startsWith('int ') && bLine?.startsWith('int ')) {
        const a = Number(aLine.split(' ')[1].replace('_', ''));
        const b = Number(bLine.split(' ')[1].replace('_', ''));

        if (a < 256 && b < 256) {
          popTeal();
          popTeal();

          pushTeal(`extract ${a} ${b}`);

          optimized = true;
        }
      }
    } else if (teal.startsWith('btoi')) {
      if (outputTeal.at(-1)?.match(/^byte (0x|")/)) {
        const hexBytes = getHexBytes(outputTeal.at(-1)!.split(' ')[1]);
        popTeal();

        pushTeal(`int ${parseInt(hexBytes, 16)}`);

        optimized = true;
      }
    } else if (teal.startsWith('itob')) {
      if (outputTeal.at(-1)?.startsWith('int ')) {
        const n = Number(outputTeal.at(-1)!.split(' ')[1]);
        popTeal();

        pushTeal(`byte 0x${n.toString(16).padStart(16, '0')}`);

        optimized = true;
      }
    } else if (teal.startsWith('concat')) {
      const b = outputTeal.at(-1);
      const a = outputTeal.at(-2);

      if (a?.match(/^byte (0x|")/) && b?.match(/^byte (0x|")/)) {
        let aBytes = a.split(' ')[1];
        let bBytes = b.split(' ')[1];

        aBytes = getHexBytes(aBytes);
        bBytes = getHexBytes(bBytes);

        popTeal();
        popTeal();

        pushTeal(`byte 0x${aBytes}${bBytes}`);

        optimized = true;
      }
    } else if (teal.match(/^byte (0x|")/)) {
      const b = outputTeal.at(-1);
      const a = outputTeal.at(-2);

      if (a?.match(/^byte (0x|")/) && b?.startsWith('concat')) {
        let aBytes = a.split(' ')[1];
        let bBytes = teal.split(' ')[1];

        aBytes = getHexBytes(aBytes);
        bBytes = getHexBytes(bBytes);

        popTeal();
        popTeal();

        pushTeal(`byte 0x${aBytes}${bBytes}`);

        optimized = true;
      }
    } else if (teal.startsWith('+') || teal.startsWith('-') || teal.startsWith('*') || teal.startsWith('/')) {
      const aLine = outputTeal.at(-2);
      const bLine = outputTeal.at(-1);

      if (aLine?.startsWith('int ') && bLine?.startsWith('int ')) {
        const a = Number(aLine.split(' ')[1].replace('_', ''));
        const b = Number(bLine.split(' ')[1].replace('_', ''));

        popTeal();
        popTeal();

        let val: number;

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

        pushTeal(`int ${val}`);
        optimized = true;
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
