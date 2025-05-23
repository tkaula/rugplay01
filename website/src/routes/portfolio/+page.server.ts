import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ request }) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session?.user) {
        throw redirect(302, '/');
    }

    return {
        user: session.user
    };
}
