import test from "node:test";
import assert from "node:assert/strict";
import { flightKeyframes } from "../src/motion.js";

test("card flight starts at the hand center and lands precisely on the discard", () => {
  const frames = flightKeyframes(
    { left: 10, top: 400, width: 80, height: 120 },
    { left: 200, top: 150, width: 100, height: 150 },
  );
  assert.equal(
    frames[0].transform,
    "translate(-200px,235px) rotate(0deg) scale(0.8)",
  );
  assert.deepEqual(
    frames.map((f) => f.offset),
    [0, 0.42, 0.88, 1],
  );
  assert.equal(frames.at(-1).transform, "translate(0,0) rotate(0deg) scale(1)");
  assert.ok(frames[1].transform.includes("rotate(-10deg)"));
});
test("opponent cards travel from their smaller visible stack", () => {
  const frames = flightKeyframes(
    { left: 400, top: 20, width: 20, height: 30 },
    { left: 200, top: 150, width: 100, height: 150 },
  );
  assert.ok(frames[0].transform.includes("scale(0.2)"));
  assert.ok(frames[1].transform.includes("rotate(10deg)"));
});
