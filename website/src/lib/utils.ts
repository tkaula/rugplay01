import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function getTimeBasedGreeting(name: string): string {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return `Good morning, ${name}`;
    } else if (hour < 17) {
        return `Good afternoon, ${name}`;
    } else if (hour < 22) {
        return `Good evening, ${name}`;
    } else {
        return `Good night, ${name}`;
    }
}
