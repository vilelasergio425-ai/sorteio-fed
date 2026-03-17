export function generateNumbers(count = 100, max = 100000): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max));
  }
  return Array.from(numbers);
}
