export interface CpuSnapshot {
    idle: number;
    total: number;
}

export const CPU_UPDATE_INTERVAL_MS = 1000;
export const MIN_ANIMATION_DELAY_MS = 18;
export const MAX_ANIMATION_DELAY_MS = 500;
export const ORIGINAL_PARTY_PARROT_FRAME_DELAY_MS = 50;
export const ORIGINAL_SPEED_CPU_PERCENTAGE = 65;

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

export function calculateCpuPercentage(start: CpuSnapshot, end: CpuSnapshot): number {
    const idleDifference = end.idle - start.idle;
    const totalDifference = end.total - start.total;

    if (totalDifference <= 0) {
        return 0;
    }

    return clamp((1 - idleDifference / totalDifference) * 100, 0, 100);
}

export function calculateAnimationDelay(cpuPercentage: number): number {
    const percentage = clamp(cpuPercentage, 0, 100);

    if (percentage <= ORIGINAL_SPEED_CPU_PERCENTAGE) {
        const progress = percentage / ORIGINAL_SPEED_CPU_PERCENTAGE;
        const range = MAX_ANIMATION_DELAY_MS - ORIGINAL_PARTY_PARROT_FRAME_DELAY_MS;
        return Math.round(MAX_ANIMATION_DELAY_MS - progress * range);
    }

    const progress =
        (percentage - ORIGINAL_SPEED_CPU_PERCENTAGE) /
        (100 - ORIGINAL_SPEED_CPU_PERCENTAGE);
    const range = ORIGINAL_PARTY_PARROT_FRAME_DELAY_MS - MIN_ANIMATION_DELAY_MS;
    return Math.round(ORIGINAL_PARTY_PARROT_FRAME_DELAY_MS - progress * range);
}
