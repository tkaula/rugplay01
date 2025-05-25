import Redis from 'ioredis';
import { building } from '$app/environment';
import { REDIS_URL } from '$env/static/private';

if (building) {
    throw new Error('Redis cannot be used during build');
}

const redis = new Redis(REDIS_URL);

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

export { redis };
