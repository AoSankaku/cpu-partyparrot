import {
    action,
    KeyAction,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent
} from "@elgato/streamdeck";
import * as os from "node:os";

import {
    calculateAnimationDelay,
    calculateCpuPercentage,
    CPU_UPDATE_INTERVAL_MS,
    CpuSnapshot
} from "../monitoring";

interface ContextState {
    action: KeyAction;
    animationSetIndex: number;
    frameIndex: number;
    lastImage?: string;
    lastTitle?: string;
}

@action({ UUID: "net.aosankaku.cpu-partyparrot.cpu-usage" })
export class CpuUsage extends SingletonAction {
    private readonly contexts = new Map<string, ContextState>();
    private cpuTimer?: NodeJS.Timeout;
    private animationTimer?: NodeJS.Timeout;
    private cpuHistory?: CpuSnapshot;
    private currentCpuPercentage = 0;
    private loopGeneration = 0;

    private readonly animationSets: readonly (readonly string[])[] = [
        ["imgs/frame_00", "imgs/frame_01", "imgs/frame_02", "imgs/frame_03", "imgs/frame_04",
            "imgs/frame_05", "imgs/frame_06", "imgs/frame_07", "imgs/frame_08", "imgs/frame_09"],
        ["imgs/conga_line_frame_00", "imgs/conga_line_frame_01", "imgs/conga_line_frame_02", "imgs/conga_line_frame_03", "imgs/conga_line_frame_04",
            "imgs/conga_line_frame_05", "imgs/conga_line_frame_06", "imgs/conga_line_frame_07", "imgs/conga_line_frame_08", "imgs/conga_line_frame_09"],
        ["imgs/blobcatrainbow_frame_00", "imgs/blobcatrainbow_frame_01", "imgs/blobcatrainbow_frame_02", "imgs/blobcatrainbow_frame_03", "imgs/blobcatrainbow_frame_04",
            "imgs/blobcatrainbow_frame_05", "imgs/blobcatrainbow_frame_06", "imgs/blobcatrainbow_frame_07", "imgs/blobcatrainbow_frame_08", "imgs/blobcatrainbow_frame_09"],
        ["imgs/sirocco_frame_00", "imgs/sirocco_frame_01", "imgs/sirocco_frame_02", "imgs/sirocco_frame_03", "imgs/sirocco_frame_04",
            "imgs/sirocco_frame_05", "imgs/sirocco_frame_06", "imgs/sirocco_frame_07", "imgs/sirocco_frame_08", "imgs/sirocco_frame_09"]
    ];

    override onWillAppear(ev: WillAppearEvent): void {
        if (!ev.action.isKey()) {
            return;
        }

        const wasEmpty = this.contexts.size === 0;
        this.contexts.set(ev.action.id, {
            action: ev.action,
            animationSetIndex: 0,
            frameIndex: 0
        });

        if (wasEmpty) {
            this.startLoops();
        }
    }

    override onWillDisappear(ev: WillDisappearEvent): void {
        this.contexts.delete(ev.action.id);
        if (this.contexts.size === 0) {
            this.stopLoops();
        }
    }

    override onKeyDown(ev: KeyDownEvent): void {
        const state = this.contexts.get(ev.action.id);
        if (!state) {
            return;
        }

        state.animationSetIndex = (state.animationSetIndex + 1) % this.animationSets.length;
        state.frameIndex %= this.animationSets[state.animationSetIndex].length;
        state.lastImage = undefined;
    }

    private startLoops(): void {
        this.stopLoops();
        const generation = ++this.loopGeneration;
        this.cpuHistory = this.getCpuInfo();
        this.cpuTimer = setTimeout(
            () => void this.runCpuLoop(generation),
            CPU_UPDATE_INTERVAL_MS
        );
        void this.runAnimationLoop(generation);
    }

    private stopLoops(): void {
        ++this.loopGeneration;

        if (this.cpuTimer) {
            clearTimeout(this.cpuTimer);
            this.cpuTimer = undefined;
        }
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = undefined;
        }

        this.cpuHistory = undefined;
        this.currentCpuPercentage = 0;
    }

    private isLoopActive(generation: number): boolean {
        return generation === this.loopGeneration && this.contexts.size > 0;
    }

    private async runCpuLoop(generation: number): Promise<void> {
        if (!this.isLoopActive(generation)) {
            return;
        }

        const end = this.getCpuInfo();
        if (this.cpuHistory) {
            this.currentCpuPercentage = calculateCpuPercentage(this.cpuHistory, end);
        }
        this.cpuHistory = end;

        const title = `CPU ${Math.round(this.currentCpuPercentage)}%`;
        const updates: Promise<void>[] = [];
        for (const state of this.contexts.values()) {
            if (state.lastTitle !== title) {
                state.lastTitle = title;
                updates.push(state.action.setTitle(title));
            }
        }
        await Promise.allSettled(updates);

        if (this.isLoopActive(generation)) {
            this.cpuTimer = setTimeout(
                () => void this.runCpuLoop(generation),
                CPU_UPDATE_INTERVAL_MS
            );
        }
    }

    private async runAnimationLoop(generation: number): Promise<void> {
        if (!this.isLoopActive(generation)) {
            return;
        }

        const updates: Promise<void>[] = [];
        for (const state of this.contexts.values()) {
            const frames = this.animationSets[state.animationSetIndex];
            const image = frames[state.frameIndex];
            state.frameIndex = (state.frameIndex + 1) % frames.length;

            if (state.lastImage !== image) {
                state.lastImage = image;
                updates.push(state.action.setImage(image));
            }
        }
        await Promise.allSettled(updates);

        if (this.isLoopActive(generation)) {
            this.animationTimer = setTimeout(
                () => void this.runAnimationLoop(generation),
                calculateAnimationDelay(this.currentCpuPercentage)
            );
        }
    }

    private getCpuInfo(): CpuSnapshot {
        let idle = 0;
        let total = 0;

        for (const cpu of os.cpus()) {
            idle += cpu.times.idle;
            total += Object.values(cpu.times).reduce((sum, ticks) => sum + ticks, 0);
        }

        return { idle, total };
    }
}
