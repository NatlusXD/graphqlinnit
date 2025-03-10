import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = Number(process.env.REDIS_PORT) || 6379;

console.log(`connecting to redis: ${redisHost}:${redisPort}`);

const redisPub = new Redis("redis://redis:6379");
const redisSub = new Redis("redis://redis:6379");

redisPub.on("error", (err) => console.error("RedisPub err:", err));
redisSub.on("error", (err) => console.error("RedisSub err:", err));

export { redisPub, redisSub };
