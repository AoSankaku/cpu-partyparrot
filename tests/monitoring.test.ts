import assert from "node:assert/strict";
import test from "node:test";

import {
    calculateAnimationDelay,
    calculateCpuPercentage,
    MAX_ANIMATION_DELAY_MS,
    MIN_ANIMATION_DELAY_MS
} from "../src/monitoring.js";

test("calculateCpuPercentage calculates and clamps CPU usage", () => {
    assert.equal(calculateCpuPercentage({ idle: 100, total: 1000 }, { idle: 150, total: 1100 }), 50);
    assert.equal(calculateCpuPercentage({ idle: 100, total: 1000 }, { idle: 250, total: 1100 }), 0);
    assert.equal(calculateCpuPercentage({ idle: 100, total: 1000 }, { idle: 50, total: 1100 }), 100);
});

test("calculateCpuPercentage handles an invalid or unchanged sample", () => {
    assert.equal(calculateCpuPercentage({ idle: 100, total: 1000 }, { idle: 100, total: 1000 }), 0);
    assert.equal(calculateCpuPercentage({ idle: 100, total: 1000 }, { idle: 90, total: 900 }), 0);
});

test("calculateAnimationDelay keeps a safe non-zero lower bound", () => {
    assert.equal(calculateAnimationDelay(-10), MAX_ANIMATION_DELAY_MS);
    assert.equal(calculateAnimationDelay(0), MAX_ANIMATION_DELAY_MS);
    assert.equal(calculateAnimationDelay(50), 325);
    assert.equal(calculateAnimationDelay(100), MIN_ANIMATION_DELAY_MS);
    assert.equal(calculateAnimationDelay(150), MIN_ANIMATION_DELAY_MS);
});
