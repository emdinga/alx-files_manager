import redis from 'redis';


class RedisClient {
    constructor() {
        this.client = redis.createClient();

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (err) {
                    console.error('Redis get error:', err);
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.setex(key, duration, value, (err, reply) => {
                if (err) {
                    console.error('Redis set error:', err);
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, reply) => {
                if (err) {
                    console.error('Redis del error:', err);
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }
}

const redisClient = new RedisClient();
export default redisClient;
