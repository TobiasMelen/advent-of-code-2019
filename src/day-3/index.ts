import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import { assertNotEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";

type Point = { x: number; y: number };
type Line = [Point, Point];
type Direction = "U" | "D" | "R" | "L";
type Movement = [Direction, number];

const dividePoints = (
  point1: readonly [number, number],
  point2: readonly [number, number]
) => point1[0] * point2[1] - point1[1] * point2[0];

function findIntersection(line: Line, otherLine: Line): Point | null {
  const xDiff = [
    line[0].x - line[1].x,
    otherLine[0].x - otherLine[1].x
  ] as const;
  const yDiff = [
    line[0].y - line[1].y,
    otherLine[0].y - otherLine[1].y
  ] as const;
  const divDiff = dividePoints(xDiff, yDiff);
  if (divDiff === 0) {
    return null;
  }
  return { x: 1, y: 1 };
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
    const startingPoint = acc[index - 1]?.[0] ?? { x: 0, y: 0 };
    acc.push([startingPoint, getPointFromMovement(move, startingPoint)]);
    return acc;
  }, [] as Line[]);

const parseMovement = (moveInput: string) =>
  [moveInput.substr(0, 1), parseInt(moveInput.substring(1))] as Movement;

function getClosestIntersection(...input: string[][]) {
  const shapes = input.map(moves =>
    getLinesFromMoves(moves.map(parseMovement))
  );
  //totally makes sense On3000
  const intersections = shapes.reduce((intersections, shape, index) => {
    intersections.push(
      ...shapes
        //Only compare this shape to shapes with higher index to prevent duplicate comparisions
        .filter((_, innerIndex) => innerIndex > index)
        .reduce((intersections, otherShape) => {
          intersections.push(
            ...shape.reduce((intersections, line) => {
              intersections.push(
                ...otherShape.reduce((intersections, otherLine) => {
                  const intersection = findIntersection(line, otherLine);
                  intersection != null && intersections.push(intersection);
                  return intersections;
                }, [] as Point[])
              );
              return intersections;
            }, [] as Point[])
          );
          return intersections;
        }, [] as Point[])
    );
    return intersections;
  }, [] as Point[]);

  return Math.min(...intersections.map(calcManhattanDistance));
}

test("Star1 - Case2", () => {
  const intersectionDistance = getClosestIntersection(
    ["R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72"],
    ["U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83"]
  );
  assertEquals(intersectionDistance, 2);
});

//@ts-ignore top-level await
await runTests();
