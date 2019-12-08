import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { runTests, test } from "https://deno.land/std/testing/mod.ts";
import readFileString from "../readFile.ts";
import relativePath from "../relativePath.ts";

const createThreeIndexMutationOperation = (
  program: number[],
  operation: (val1: number, val2: number) => number
) => (index: number) => {
  program[program[index + 3]] = operation(
    program[program[index + 1]],
    program[program[index + 2]]
  );
  return index + 4;
};

function runIntCodeProgram(source: number[]) {
  const program = [...source];
  const add = createThreeIndexMutationOperation(
    program,
    (val1, val2) => val1 + val2
  );
  const multiply = createThreeIndexMutationOperation(
    program,
    (val1, val2) => val1 * val2
  );
  return (function performOperation(index: number): number[] {
    switch (program[index]) {
      case 99:
        return program;
      case 1: {
        const nextIndex = add(index);
        return performOperation(nextIndex);
      }
      case 2: {
        const nextIndex = multiply(index);
        return performOperation(nextIndex);
      }
      default: {
        throw new Error(
          `Program is invalid. Expecting opcode at index ${index} but got value ${program[index]}`
        );
      }
    }
  })(0);
}

//Yeah, i cheated doing the second star.
//The whole second star of this felt like doing a PISA test of english reading comprehension, but written by an insane person.
//In the end it's about replacing values in the input program at index 1 and 2 to test for a desired result.
//I had moderate amounts of fun trying to figure this out, shoutouts to random internet person doing it for me.
function replaceIndex1and2(
  program: number[],
  index1Value: number,
  index2Value: number
) {
  const copiedProgram = [...program];
  copiedProgram.splice(1, 2, index1Value, index2Value);
  return copiedProgram;
}

//to dumb to give a better name
const getSecondStar = (input: number[], desiredResult: number) => {
  return (function recursiveCheck(noun = 0, verb = 0): number {
    if (noun > 100) {
      throw new Error(
        "No verb or noun combination between 0-100 yields the desired result"
      );
    }
    const program = replaceIndex1and2(input, noun, verb);
    if (runIntCodeProgram(program)[0] === desiredResult) {
      return 100 * noun + verb;
    }
    return verb >= 100
      ? recursiveCheck(noun + 1, 0)
      : recursiveCheck(noun, verb + 1);
  })();
};

const assertIntCodeProgram = (input: number[], expected: number[]) => {
  assertEquals(runIntCodeProgram(input), expected);
};
test("Star1 - Case1", () =>
  assertIntCodeProgram([1, 0, 0, 0, 99], [2, 0, 0, 0, 99]));

test("Star1 - Case2", () =>
  assertIntCodeProgram([2, 3, 0, 3, 99], [2, 3, 0, 6, 99]));

test("Star1 - Case3", () =>
  assertIntCodeProgram([2, 4, 4, 5, 99, 0], [2, 4, 4, 5, 99, 9801]));

test("Star1 - Case4", () =>
  assertIntCodeProgram(
    [1, 1, 1, 4, 99, 5, 6, 0, 99],
    [30, 1, 1, 4, 2, 5, 6, 0, 99]
  ));

//The only test case for star 2 is the solution, so i'm making that part of the test-suite
//meaning the rest of the file is an intermingled mess.
//@ts-ignore top-level await
const input = await readFileString(relativePath(import.meta.url, "input.txt"))
  .then(fileContents => fileContents.split(","))
  .then(strings =>
    strings.map(
      value =>
        parseInt(value) ??
        (() => {
          throw new Error(`Cant parse value "${value}" to int`);
        })()
    )
  );

const secondStarResult = getSecondStar(input, 19690720);

test("Star2 - Actual result", () => assertEquals(secondStarResult, 6472));

if(Deno.args.find(arg => arg === "-t" || arg === "--test")){
    //@ts-ignore top-level await
    await runTests();
    Deno.exit();
}

const firstStarInput = replaceIndex1and2(input, 12, 2);

console.log("First star result is", runIntCodeProgram(firstStarInput)[0]);

console.log("Second star result is", secondStarResult);
