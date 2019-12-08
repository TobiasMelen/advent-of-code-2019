import { runTests, test } from "https://deno.land/std/testing/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { readFileLines } from "../readFile.ts";
import relativePath from "../relativePath.ts";
import sum from "../sum.ts";

//Actual logic functions
const calcFuel = (number: number) => Math.floor(number / 3) - 2;

function calcFuelWithFuelForFuel(source: number): number {
  const fuel = calcFuel(source);
  return fuel > 0 ? fuel + calcFuelWithFuelForFuel(fuel) : 0;
}

//Setup and run tests for web examples
const createTester = (fn: (source: number) => number) => (
  name: string,
  input: number,
  expected: number
) => ({
  name,
  fn() {
    const result = fn(input);
    assertEquals(result, expected);
  }
});

const calcFuelTest = createTester(calcFuel);
test(calcFuelTest("Star1 - Case 1", 12, 2));
test(calcFuelTest("Star1 - Case 2", 14, 2));
test(calcFuelTest("Star1 - Case 3", 1969, 654));
test(calcFuelTest("Star1 - Case 4", 100756, 33583));

const calcFuelWithFuelForFuelTest = createTester(calcFuelWithFuelForFuel);
test(calcFuelWithFuelForFuelTest("Star2 - Case 1", 14, 2));
test(calcFuelWithFuelForFuelTest("Star2 - Case 2", 1969, 966));
test(calcFuelWithFuelForFuelTest("Star2 - Case 3", 100756, 50346));

if (Deno.args.find(arg => arg === "-t" || "--test")) {
  //@ts-ignore top level await
  await runTests();
  Deno.exit();
}

//Main program run from input.txt starts here.
//@ts-ignore top level await
const input = await readFileLines(
  relativePath(import.meta.url, "input.txt")
).then(lines => lines.map(line => parseInt(line)));

console.log("First star result: ", sum(input, calcFuel));

console.log("Second star result: ", sum(input, calcFuelWithFuelForFuel));
