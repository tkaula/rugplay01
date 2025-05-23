import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ url }) {
    const username = url.searchParams.get('username');
    if (!username) {
        return json({ available: false });
    }

    const exists = await db.query.user.findFirst({
        where: eq(user.username, username)
    });

    return json({ available: !exists });
}
