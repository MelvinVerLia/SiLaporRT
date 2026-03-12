import Redis from "ioredis";

let _instance: Redis;

export function getRedisInstance(): Redis {
  if (!_instance) {
    _instance = new Redis(process.env.REDIS_URL!, {
      tls: {},
    });
    _instance.on("error", (err) => console.log("Redis Client Error", err));
  }
  return _instance;
}
