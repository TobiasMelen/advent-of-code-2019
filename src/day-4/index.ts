import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import sum from "../sum.ts";

const input = [136760, 595730] as const;

function passwordMeetsCriteria(password: number, allowThreePeats = true) {
  const splitPassword = password
    .toString()
    .split("")
    .map(char => parseInt(char));
  let lastRepeatIndex = null;
  for (let index = 1; index < splitPassword.length; index++) {
    const current = splitPassword[index];
    const prev = splitPassword[index - 1];
    if (current < prev) {
      return false;
    }
    if (
      current === prev &&
      //If we have had a repeat that is validated ok before, we don't need to check this one.
      (!lastRepeatIndex || lastRepeatIndex == index - 1)
    ) {
      //has a matching pair if threepeats arent banned and this isn't one.
      lastRepeatIndex =
        allowThreePeats || (splitPassword[index - 2] !== current && index);
    }
  }
  return !!lastRepeatIndex;
}

const createInputRange = (start: number, end: number) =>
  new Array(end - start + 1).fill(undefined).map((_, index) => index + start);

test("Star1 - Case1", () => assertEquals(passwordMeetsCriteria(111111), true));
test("Star1 - Case2", () => assertEquals(passwordMeetsCriteria(223450), false));
test("Star1 - Case3", () => assertEquals(passwordMeetsCriteria(123789), false));
test("Star1 - FailingCase1", () =>
  assertEquals(passwordMeetsCriteria(595722), false));
test("Star2 - Case1", () =>
  assertEquals(passwordMeetsCriteria(112233, false), true));
test("Star2 - Case2", () =>
  assertEquals(passwordMeetsCriteria(123444, false), false));
test("Star2 - Case3", () =>
  assertEquals(passwordMeetsCriteria(111122, false), true));
test("RangeCreator", () =>
  assertEquals(createInputRange(3, 7), [3, 4, 5, 6, 7]));

//@ts-ignore top level await
await runTests();

const range = createInputRange(...input);

const star1Passwords = range.filter(password =>
  passwordMeetsCriteria(password)
);
console.log("Star1 result is", star1Passwords.length);

const star2Passwords = range.filter(password =>
  passwordMeetsCriteria(password, false)
);
console.log("Star2 result is", star2Passwords.length);
