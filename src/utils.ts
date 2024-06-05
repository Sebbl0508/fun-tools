
export function deg2rad(deg: number): number {
    return deg * (Math.PI / 180.0);
}

export function coolLerp(current: number, target: number, value: number, dt: number): number {
    return (target - current) * (1.0 - Math.exp(-value * dt));
}

export function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function numMap(val: number, min1: number, max1: number, min2: number, max2: number): number {
    return min2 + (max2 - min2) * ((val - min1) / (max1 - min1));
}