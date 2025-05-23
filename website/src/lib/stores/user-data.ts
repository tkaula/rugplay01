import { writable } from 'svelte/store';

export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    isAdmin: boolean;
    image: string;
    isBanned: boolean;
    banReason: string | null;
    avatarUrl: string | null;
    bio: string;
} | null;

export const USER_DATA = writable<User>(undefined);