import assert from "node:assert/strict";
import test from "node:test";

import {
    getNextAnimationSetIndex,
    normalizeAnimationSetIndex
} from "../src/character-selection.js";

test("normalizeAnimationSetIndex restores a valid saved selection", () => {
    assert.equal(normalizeAnimationSetIndex(0, 4), 0);
    assert.equal(normalizeAnimationSetIndex(3, 4), 3);
});

test("normalizeAnimationSetIndex falls back for invalid saved selections", () => {
    assert.equal(normalizeAnimationSetIndex(undefined, 4), 0);
    assert.equal(normalizeAnimationSetIndex("2", 4), 0);
    assert.equal(normalizeAnimationSetIndex(-1, 4), 0);
    assert.equal(normalizeAnimationSetIndex(1.5, 4), 0);
    assert.equal(normalizeAnimationSetIndex(4, 4), 0);
});

test("getNextAnimationSetIndex cycles through every animation set", () => {
    assert.equal(getNextAnimationSetIndex(0, 4), 1);
    assert.equal(getNextAnimationSetIndex(2, 4), 3);
    assert.equal(getNextAnimationSetIndex(3, 4), 0);
    assert.equal(getNextAnimationSetIndex(0, 0), 0);
});
