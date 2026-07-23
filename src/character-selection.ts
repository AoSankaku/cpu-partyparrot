export function normalizeAnimationSetIndex(
    value: unknown,
    animationSetCount: number
): number {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0 ||
        value >= animationSetCount
    ) {
        return 0;
    }

    return value;
}

export function getNextAnimationSetIndex(
    currentIndex: number,
    animationSetCount: number
): number {
    if (animationSetCount <= 0) {
        return 0;
    }

    return (normalizeAnimationSetIndex(currentIndex, animationSetCount) + 1)
        % animationSetCount;
}
