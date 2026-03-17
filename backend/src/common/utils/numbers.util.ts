export function generateNumbers(count = 100, max = 100000): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * max));
  }
  return numbers;
}
