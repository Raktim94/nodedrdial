import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ApiKey } from '../../entities/api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(@InjectRepository(ApiKey) private readonly repo: Repository<ApiKey>) {}

  async create(organizationId: string, userId: string, name: string, scopes: string[]) {
    const rawKey = `thk_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = await argon2.hash(rawKey);
    const keyPrefix = rawKey.substring(0, 12);

    const apiKey = await this.repo.save(
      this.repo.create({ organizationId, userId, name, keyHash, keyPrefix, scopes }),
    );

    return { ...apiKey, key: rawKey }; // Only shown once
  }

  async findAll(organizationId: string) {
    return this.repo.find({
      where: { organizationId },
      select: ['id', 'name', 'keyPrefix', 'scopes', 'lastUsedAt', 'expiresAt', 'isActive', 'requestCount', 'createdAt'],
    });
  }

  async revoke(organizationId: string, id: string) {
    await this.repo.update({ id, organizationId }, { isActive: false });
    return { message: 'API key revoked' };
  }

  async validate(rawKey: string): Promise<ApiKey | null> {
    const prefix = rawKey.substring(0, 12);
    const keys = await this.repo.find({
      where: { keyPrefix: prefix, isActive: true },
      select: ['id', 'keyHash', 'organizationId', 'scopes', 'expiresAt'],
    });

    for (const key of keys) {
      if (key.expiresAt && key.expiresAt < new Date()) continue;
      if (await argon2.verify(key.keyHash, rawKey)) {
        await this.repo.increment({ id: key.id }, 'requestCount', 1);
        await this.repo.update(key.id, { lastUsedAt: new Date() });
        return key;
      }
    }
    return null;
  }
}
