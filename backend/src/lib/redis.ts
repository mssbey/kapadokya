import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisAvailable = false;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('⚠️  Redis unavailable — running without cache');
      return null; // stop retrying
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('error', () => {
  redisAvailable = false;
});

redis.on('connect', () => {
  redisAvailable = true;
  console.log('✅ Connected to Redis');
});

// Try connecting but don't block startup
redis.connect().catch(() => {
  console.warn('⚠️  Redis not available — caching disabled');
});

export async function getCached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    // Redis unavailable, fall through to fetcher
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // Redis unavailable, continue without caching
  }

  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Redis unavailable
  }
}
