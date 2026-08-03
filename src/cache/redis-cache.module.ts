import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [
          new Keyv({
            store: new KeyvRedis(process.env.REDIS_URL),
          }),
        ],
        ttl: 60_000,
      }),
    }),
  ],
})
export class RedisCacheModule {}
