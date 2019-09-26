export class HistoryMgr {
    items: string[] = [''];
    index: number = 0;

    constructor() {
        this.syncPull();
    }

    clear() {
        this.items = [''];
        this.index = 0;
        this.syncPush();
    }

    push(str: string) {
        this.items.pop();
        this.items.push(str);
        this.items.push('');
        this.index = this.items.length - 1;
        this.syncPush();
    }

    go(i: number, curText: string): string {
        if (i < 0 || i >= this.items.length) {
            return curText;
        }
        this.items[this.index] = curText;
        this.index = i;
        return this.items[this.index];
    }

    goUp(curText: string): string {
        return this.go(this.index - 1, curText);
    }

    goDown(curText: string): string {
        return this.go(this.index + 1, curText);
    }

    syncPush() {
        const data = this.items;
        localStorage.setItem('term-history', JSON.stringify(data));
    }

    syncPull() {
        const json = localStorage.getItem('term-history');
        const data = json && JSON.parse(json) || [];
        this.items = data;
        this.index = Math.max(this.items.length - 1, 0);
    }
}

// function keepInRange(min: number, max: number, i: number): number {
//     if (i > max) {
//         return max;
//     }
//     if (i < min) {
//         return min;
//     }
// }
