let i = 0;

do {
  if (i === 5) {
    i = 1337;
    continue;
  }
  i += 1;
} while (i < 10);

console.log(i);
