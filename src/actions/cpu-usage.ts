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

        const update = () => {
            const now = Date.now();
            const lastUpdate = this.lastCpuUpdateTime.get(context)!;

            // Update CPU usage every second
            if (now - lastUpdate >= 1000) {
                const start = this.cpuHistory.get(context);
                const end = this.getCpuInfo();

                if (start) {
                    const idleDifference = end.idle - start.idle;
                    const totalDifference = end.total - start.total;

                    if (totalDifference > 0) {
                        const percentage = Math.max(0, (1 - idleDifference / totalDifference) * 100);
                        action.setTitle(`${percentage.toFixed(1)}%`);
                    }
                }
                this.cpuHistory.set(context, end);
                this.lastCpuUpdateTime.set(context, now);
            }

            // Update image frame (every 100ms)
            let frameIndex = this.currentFrame.get(context)!;
            action.setImage(this.framePaths[frameIndex]);
            frameIndex = (frameIndex + 1) % this.framePaths.length;
            this.currentFrame.set(context, frameIndex);

            this.timers.set(context, setTimeout(update, 100));
        };

        update();
    }

    private stopMonitoring(context: string): void {
        if (this.timers.has(context)) {
            clearTimeout(this.timers.get(context)!);
            this.timers.delete(context);
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
