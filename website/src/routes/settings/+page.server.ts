import { auth } from '$lib/auth';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
    const session = await auth.api.getSession({
        headers: event.request.headers
    });
    if (!session?.user) throw error(401, 'Not authenticated');

    return { user: session.user };
};
