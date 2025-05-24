import { PUBLIC_B2_BUCKET, PUBLIC_B2_ENDPOINT } from "$env/static/public";
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

export function getPublicUrl(key: string | null): string | null {
    if (!key) return null;
    return `${PUBLIC_B2_ENDPOINT}/${PUBLIC_B2_BUCKET}/${key}`;
}

export function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: number | undefined;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function formatPrice(price: number): string {
    if (price < 0.01) {
        return price.toFixed(6);
    } else if (price < 1) {
        return price.toFixed(4);
    } else {
        return price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

export function formatValue(value: number): string {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
}

export function formatQuantity(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
}

export function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatRelativeTime(timestamp: string | Date): string {
    const now = new Date();
    const past = new Date(timestamp);
    const ms = now.getTime() - past.getTime();

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;

    if (hours < 24) {
        const extraMinutes = minutes % 60;
        return extraMinutes === 0 ? `${hours}hr` : `${hours}hr ${extraMinutes}m`;
    }

    if (days < 7) return `${days}d`;

    const yearsDiff = now.getFullYear() - past.getFullYear();
    const monthsDiff = now.getMonth() - past.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;
    const adjustedMonths = totalMonths + (now.getDate() < past.getDate() ? -1 : 0);
    const years = Math.floor(adjustedMonths / 12);

    if (adjustedMonths < 1) {
        const weeks = Math.floor(days / 7);
        const extraDays = days % 7;
        return extraDays === 0 ? `${weeks}w` : `${weeks}w ${extraDays}d`;
    }

    if (years < 1) {
        const tempDate = new Date(past);
        tempDate.setMonth(tempDate.getMonth() + adjustedMonths);
        const remainingDays = Math.floor((now.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(remainingDays / 7);
        return weeks === 0 ? `${adjustedMonths}m` : `${adjustedMonths}m ${weeks}w`;
    }

    const remainingMonths = adjustedMonths % 12;
    return remainingMonths === 0 ? `${years}y` : `${years}y ${remainingMonths}m`;
}

export function formatTimeAgo(date: string) {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export const formatMarketCap = formatValue;
