export interface CpuSnapshot {
    idle: number;
    total: number;
}

export const CPU_UPDATE_INTERVAL_MS = 1000;
export const MIN_ANIMATION_DELAY_MS = 150;
export const MAX_ANIMATION_DELAY_MS = 500;

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
    const range = MAX_ANIMATION_DELAY_MS - MIN_ANIMATION_DELAY_MS;
    return Math.round(MAX_ANIMATION_DELAY_MS - percentage / 100 * range);
}
