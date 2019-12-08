import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { readFileLines } from "../readFile.ts";
import relativePath from "../relativePath.ts";

type Point = { x: number; y: number };
type Line = [Point, Point];
type Direction = "U" | "D" | "R" | "L";
type Movement = [Direction, number];

function findIntersection(line: Line, otherLine: Line): Point | null {
  //This is definently mostly a stack overflow paste.
  const xDiff = [
    line[0].x - line[1].x,
    otherLine[0].x - otherLine[1].x
  ] as const;
  const yDiff = [
    line[0].y - line[1].y,
    otherLine[0].y - otherLine[1].y
  ] as const;
  const dist = xDiff[0] * yDiff[1] - xDiff[1] * yDiff[0];
  if (dist === 0) {
    return null;
  }
  var tempA = line[0].x * line[1].y - line[0].y * line[1].x;
  var tempB = otherLine[0].x * otherLine[1].y - otherLine[0].y * otherLine[1].x;
  var x = (tempA * xDiff[1] - xDiff[0] * tempB) / dist;
  var y = (tempA * yDiff[1] - yDiff[0] * tempB) / dist;

  if (
    x < Math.min(line[0].x, line[1].x) ||
    x > Math.max(line[0].x, line[1].x) ||
    x < Math.min(otherLine[0].x, otherLine[1].x) ||
    x > Math.max(otherLine[0].x, otherLine[1].x)
  ) {
    return null;
  }
  if (
    y < Math.min(line[0].y, line[1].y) ||
    y > Math.max(line[0].y, line[1].y) ||
    y < Math.min(otherLine[0].y, otherLine[1].y) ||
    y > Math.max(otherLine[0].y, otherLine[1].y)
  ) {
    return null;
  }
  return { x, y };
}

const calcManhattanDistance = ({ x, y }: Point) => Math.abs(x) + Math.abs(y);

function getPointFromMovement(
  [direction, distance]: Movement,
  { x, y }: Point
): Point {
  switch (direction) {
    case "D":
      return { x, y: y - distance };
    case "L":
      return { x: x - distance, y };
    case "R":
      return { x: x + distance, y };
    case "U":
      return { x, y: y + distance };
    default: {
      ((never: never) => {
        throw new Error(`Direction should not exist, but is "${never}"`);
      })(direction);
    }
  }
}

const getLinesFromMoves = (moves: Movement[]) =>
  moves.reduce((acc, move, index) => {
    const startingPoint = acc[index - 1]?.[1] ?? { x: 0, y: 0 };
    acc.push([startingPoint, getPointFromMovement(move, startingPoint)]);
    return acc;
  }, [] as Line[]);

const parseMovement = (moveInput: string) =>
  [moveInput.substr(0, 1), parseInt(moveInput.substring(1))] as Movement;

//The recursive input is hacky, because the first point is not from the shape but an intersection.s
function backTrackShapeLength(
  [lineStart, lineEnd]: Line,
  index: number,
  shape: Line[]
): number {
  const lineLength =
    Math.abs(lineStart.x - lineEnd.x) + Math.abs(lineStart.y - lineEnd.y);
  return (
    lineLength +
    (index > 0 ? backTrackShapeLength(shape[index - 1], index - 1, shape) : 0)
  );
}

//I think this is needed although it's only used once. This is also brainbreaking territory for me, so probably not.
type PullGeneratorResult<T> = T extends Generator<infer GeneratorResult>
  ? GeneratorResult
  : never;

type IntersectionResult = PullGeneratorResult<
  ReturnType<typeof loopInterSections>
>;

function* loopInterSections(...input: string[][]) {
  const shapes = input.map(moves =>
    getLinesFromMoves(moves.map(parseMovement))
  );
  //this is a loop-nesting nightmare to support an arbitrary amount of lines
  //that wasn't needed, but i love the closing curly staircase too much.
  for (const [index, shape] of shapes.entries()) {
    for (const otherShape of shapes.filter(
      //only compare with other shapes of higher index to prevent duplicate comparisions
      (_, innerIndex) => innerIndex > index
    )) {
      for (const [lineIndex, line] of shape.entries()) {
        for (const [otherLineIndex, otherLine] of otherShape.entries()) {
          const intersection = findIntersection(line, otherLine);
          if (intersection != null) {
            yield {
              intersection,
              shape1: { shape, line, lineIndex },
              shape2: {
                shape: otherShape,
                line: otherLine,
                lineIndex: otherLineIndex
              }
            };
          }
        }
      }
    }
  }
}

function getClosestIntersection(input: IntersectionResult[]) {
  return Math.min(
    ...input
      .map(({ intersection }) => calcManhattanDistance(intersection))
      .filter(
        //There's an intersection at the start of the lines, which we disregard.
        dist => dist > 0
      )
  );
}

function getIntersectionWithShortestShapeLength(input: IntersectionResult[]) {
  const combinedShapeLengths = input.map(
    ({ shape1, shape2, intersection }) =>
      backTrackShapeLength(
        [shape1.line[0], intersection],
        shape1.lineIndex,
        shape1.shape
      ) +
      backTrackShapeLength(
        [shape2.line[0], intersection],
        shape2.lineIndex,
        shape2.shape
      )
  );
  return Math.min(...combinedShapeLengths.filter(dist => dist != 0));
}

const tester = <TReturn>(fn: (params: IntersectionResult[]) => TReturn) => (
  expected: TReturn,
  ...shapes: string[][]
) => () => {
  const intersections = Array.from(loopInterSections(...shapes));
  const result = fn(intersections);
  assertEquals(result, expected);
};

const testClosest = tester(getClosestIntersection);
const testShortest = tester(getIntersectionWithShortestShapeLength);

//Tests
test(
  "Star1 - Case1",
  testClosest(6, ["R8", "U5", "L5", "D3"], ["U7", "R6", "D4", "L4"])
);
test(
  "Star1 - Case2",
  testClosest(
    159,
    ["R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72"],
    ["U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83"]
  )
);
test(
  "Star1 - Case3",
  testClosest(
    135,
    [
      "R98",
      "U47",
      "R26",
      "D63",
      "R33",
      "U87",
      "L62",
      "D20",
      "R33",
      "U53",
      "R51"
    ],
    ["U98", "R91", "D20", "R16", "D67", "R40", "U7", "R15", "U6", "R7"]
  )
);
test(
  "Star2 - Case1",
  testShortest(30, ["R8", "U5", "L5", "D3"], ["U7", "R6", "D4", "L4"])
);
test(
  "Star2 - Case2",
  testShortest(
    610,
    ["R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72"],
    ["U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83"]
  )
);
test(
  "Star2 - Case3",
  testShortest(
    410,
    [
      "R98",
      "U47",
      "R26",
      "D63",
      "R33",
      "U87",
      "L62",
      "D20",
      "R33",
      "U53",
      "R51"
    ],
    ["U98", "R91", "D20", "R16", "D67", "R40", "U7", "R15", "U6", "R7"]
  )
);

if (Deno.args.find(arg => arg === "-t" || arg === "--test")) {
  //@ts-ignore top-level await
  await runTests();
  Deno.exit();
}

//@ts-ignore top level await
const moveGroups = await readFileLines(
  relativePath(import.meta.url, "input.txt")
).then(lines => lines.map(line => line.split(",")));

const intersections = Array.from(loopInterSections(...moveGroups));

console.log("First star result is", getClosestIntersection(intersections));
console.log(
  "Second star result is",
  getIntersectionWithShortestShapeLength(intersections)
);
