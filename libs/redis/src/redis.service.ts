import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import ioRedis from 'ioredis';
import Bull from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService extends ioRedis implements OnModuleInit, OnModuleDestroy {
    private _logger = new Logger(RedisService.name);

    constructor() {
        const configService = new ConfigService();
        const redisConfig = {
            host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
            port: configService.get<number>('REDIS_PORT', 6379),
            lazyConnect: true,
            enableAutoPipelining: true,
            enableOfflineQueue: true,
        };
        super(redisConfig);
    }

    async onModuleInit(): Promise<void> {
        this._logger.log('onModuleInit');
        try {
            await this.connect();
            this.on('connect', () => this._logger.log('Connected to redis instance'));
            this.on('ready', () => this._logger.log('Redis instance is ready (data loaded from disk)'));
            this.on('error', (err) => this._logger.error(err, err.stack));
        } catch (err) {
            this._logger.error(err, err.stack);
        }
    }

    async onModuleDestroy(): Promise<void> {
        this._logger.log('onModuleDestroy');
        this.disconnect();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async bullQueue<T = any>(queueName: string): Promise<Bull.Queue<T>> {
        const queue = new Bull<T>(queueName, {
            redis: {
                ...this.config,
            },
        });
        return queue;
    }
}
