import { auth } from '$lib/auth';
import type { LayoutServerLoad } from './$types';
import { dev } from '$app/environment';

export const load: LayoutServerLoad = async (event) => {
    event.setHeaders({
        'Cache-Control': dev
            ? 'no-cache'
            : 'private, max-age=30'
    });

    const sessionResponse = await auth.api.getSession({
        headers: event.request.headers
    });

    return {
        userSession: sessionResponse?.user || null,
        url: event.url.pathname,
    };
};