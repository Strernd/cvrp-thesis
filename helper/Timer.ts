export class Timer {
    startTime: [number, number];
    safetyMargin: number;
    constructor(safetyMargin: number = 0) {
        this.startTime = process.hrtime();
        this.safetyMargin = safetyMargin;
    }

    public get(): number {
        const time = process.hrtime(this.startTime);
        return (time[0] * 1000) + (time[1] / 1000000) + this.safetyMargin;
    }
}