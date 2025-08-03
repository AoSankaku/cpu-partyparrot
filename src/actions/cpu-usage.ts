import { action, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import * as os from "os";

@action({ UUID: "com.aosankaku.cpu-partyparrot.cpu-usage" })
export class CpuUsage extends SingletonAction<any> {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private cpuHistory: Map<string, { idle: number, total: number }> = new Map();

    override onWillAppear(ev: WillAppearEvent<any>): void {
        this.startMonitoring(ev.action, ev.action.id);
    }

    override onWillDisappear(ev: WillDisappearEvent<any>): void {
        this.stopMonitoring(ev.action.id);
    }

    private startMonitoring(action: any, context: string): void {
        this.stopMonitoring(context);
        this.cpuHistory.set(context, this.getCpuInfo());

        const update = () => {
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
            this.timers.set(context, setTimeout(update, 1000));
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
