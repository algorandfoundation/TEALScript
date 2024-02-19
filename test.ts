let i = 0;

for (let j = 0; j < 10; j += 1) {
  if (i === 5) {
    i = 1337;
    continue;
  }
  i += 1;
}

console.log(i);
