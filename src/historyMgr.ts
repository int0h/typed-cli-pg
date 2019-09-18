export class HistoryMgr {
    items: string[] = [''];
    index: number = 0;

    push(str: string) {
        this.items[this.items.length - 1] = str;
        this.items.push('');
        this.index = this.items.length - 1;
    }

    go(i: number, curText: string): string {
        if (i < 0 || i >= this.items.length) {
            return this.items[this.index];
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
}

// function keepInRange(min: number, max: number, i: number): number {
//     if (i > max) {
//         return max;
//     }
//     if (i < min) {
//         return min;
//     }
// }
