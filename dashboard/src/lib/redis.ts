import { Redis } from "@upstash/redis";

// connection to Redis database
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!, //reads redis rest url
  token: process.env.UPSTASH_REDIS_REST_TOKEN!, //reads token that vercel injected
});
