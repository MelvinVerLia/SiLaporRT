import Redis from "ioredis";

export class RedisClient {
  private static _instance: Redis;
  static get instance() {
    if (!this._instance) {
      this._instance = new Redis(process.env.UPSTASH_REDIS_REST_URL!, {
        password: process.env.UPSTASH_REDIS_REST_TOKEN!,
        tls: {},
      });
      this._instance.on("error", (err) =>
        console.log("Redis Client Error", err)
      );
    }
    return this._instance;
  }
}
