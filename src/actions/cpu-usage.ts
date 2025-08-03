import { action, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import * as os from "os";

@action({ UUID: "com.aosankaku.cpu-partyparrot.cpu-usage" })
export class CpuUsage extends SingletonAction<any> {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private cpuHistory: Map<string, { idle: number, total: number }> = new Map();
    private currentFrame: Map<string, number> = new Map();
    private framePaths: string[] = [
        "imgs/frame_00", "imgs/frame_01", "imgs/frame_02", "imgs/frame_03", "imgs/frame_04",
        "imgs/frame_05", "imgs/frame_06", "imgs/frame_07", "imgs/frame_08", "imgs/frame_09"
    ];

    private lastCpuUpdateTime: Map<string, number> = new Map();
    private currentCpuPercentage: Map<string, number> = new Map();

    override onWillAppear(ev: WillAppearEvent<any>): void {
        this.startMonitoring(ev.action, ev.action.id);
    }

    override onWillDisappear(ev: WillDisappearEvent<any>): void {
        this.stopMonitoring(ev.action.id);
    }

    private startMonitoring(action: any, context: string): void {
        this.stopMonitoring(context);
        this.cpuHistory.set(context, this.getCpuInfo());
        this.currentFrame.set(context, 0);
        this.lastCpuUpdateTime.set(context, Date.now());
        this.currentCpuPercentage.set(context, 0); // Initialize

        // Start CPU monitoring loop
        const cpuUpdateLoop = () => {
            const start = this.cpuHistory.get(context);
            const end = this.getCpuInfo();

            if (start) {
                const idleDifference = end.idle - start.idle;
                const totalDifference = end.total - start.total;

                if (totalDifference > 0) {
                    const percentage = Math.max(0, (1 - idleDifference / totalDifference) * 100);
                    action.setTitle(`${percentage.toFixed(1)}%`);
                    this.currentCpuPercentage.set(context, percentage); // Store for animation
                }
            }
            this.cpuHistory.set(context, end);
            this.lastCpuUpdateTime.set(context, Date.now());
            this.timers.set(context + '_cpu', setTimeout(cpuUpdateLoop, 1000)); // Timer for CPU updates
        };

        // Start animation loop
        const animationLoop = () => {
            let frameIndex = this.currentFrame.get(context)!;
            action.setImage(this.framePaths[frameIndex]);
            frameIndex = (frameIndex + 1) % this.framePaths.length;
            this.currentFrame.set(context, frameIndex);

            const percentage = this.currentCpuPercentage.get(context)!;
            const minDelay = 20; // ms
            const maxDelay = 220; // ms
            let animationDelay = maxDelay - (percentage / 100) * (maxDelay - minDelay);
            animationDelay = Math.max(minDelay, Math.min(maxDelay, animationDelay)); // Clamp values

            this.timers.set(context + '_animation', setTimeout(animationLoop, animationDelay)); // Timer for animation
        };

        cpuUpdateLoop(); // Initial call
        animationLoop(); // Initial call
    }

    private stopMonitoring(context: string): void {
        if (this.timers.has(context + '_cpu')) {
            clearTimeout(this.timers.get(context + '_cpu')!);
            this.timers.delete(context + '_cpu');
        }
        if (this.timers.has(context + '_animation')) {
            clearTimeout(this.timers.get(context + '_animation')!);
            this.timers.delete(context + '_animation');
        }
        if (this.cpuHistory.has(context)) {
            this.cpuHistory.delete(context);
        }
        if (this.currentFrame.has(context)) {
            this.currentFrame.delete(context);
        }
        if (this.lastCpuUpdateTime.has(context)) {
            this.lastCpuUpdateTime.delete(context);
        }
        if (this.currentCpuPercentage.has(context)) {
            this.currentCpuPercentage.delete(context);
        }
    }

    private getCpuInfo(): { idle: number, total: number } {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        }

        return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
    }
}
