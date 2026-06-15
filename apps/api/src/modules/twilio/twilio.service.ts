import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import { AccessToken } from 'twilio/lib/jwt/AccessToken';
import VoiceGrant = AccessToken.VoiceGrant;
import { TwilioCredential } from '../../entities/twilio-credential.entity';
import { PhoneNumber } from '../../entities/phone-number.entity';
import { encrypt, decrypt } from '../../common/utils/encryption.util';
import { SaveCredentialsDto, TestConnectionDto } from './dto/twilio.dto';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly clients = new Map<string, Twilio.Twilio>();

  constructor(
    @InjectRepository(TwilioCredential)
    private readonly credRepo: Repository<TwilioCredential>,
    @InjectRepository(PhoneNumber)
    private readonly phoneRepo: Repository<PhoneNumber>,
    private readonly config: ConfigService,
  ) {}

  private getEncryptionKey(): string {
    const key = this.config.get('ENCRYPTION_KEY');
    if (!key) throw new Error('ENCRYPTION_KEY not configured');
    return key;
  }

  async getClient(organizationId: string): Promise<Twilio.Twilio> {
    if (this.clients.has(organizationId)) {
      return this.clients.get(organizationId);
    }

    const cred = await this.credRepo.findOne({ where: { organizationId } });
    if (!cred) throw new NotFoundException('Twilio credentials not configured for this organization');

    const key = this.getEncryptionKey();
    const accountSid = decrypt(cred.accountSidEncrypted, key);

    let client: Twilio.Twilio;

    // Case 2 (recommended): API Key SID + API Secret — revocable, production-safe
    if (cred.apiKeyEncrypted && cred.apiSecretEncrypted) {
      const apiKey = decrypt(cred.apiKeyEncrypted, key);
      const apiSecret = decrypt(cred.apiSecretEncrypted, key);
      client = Twilio(apiKey, apiSecret, { accountSid });
    } else if (cred.authTokenEncrypted) {
      // Case 1 (testing only): Account SID + Auth Token
      const authToken = decrypt(cred.authTokenEncrypted, key);
      client = Twilio(accountSid, authToken);
    } else {
      throw new BadRequestException(
        'No valid Twilio credentials. Provide either API Key + Secret (recommended) or Auth Token.',
      );
    }

    this.clients.set(organizationId, client);
    return client;
  }

  async saveCredentials(organizationId: string, dto: SaveCredentialsDto) {
    const hasAuthToken = !!dto.authToken;
    const hasApiKey = !!(dto.apiKey && dto.apiSecret);

    if (!hasAuthToken && !hasApiKey) {
      throw new BadRequestException(
        'Provide either Auth Token (Case 1 — testing) or both API Key and API Secret (Case 2 — production).',
      );
    }
    if (dto.apiKey && !dto.apiSecret) {
      throw new BadRequestException('API Secret is required when providing an API Key.');
    }

    const key = this.getEncryptionKey();
    const existing = await this.credRepo.findOne({ where: { organizationId } });

    const data: Partial<TwilioCredential> = {
      organizationId,
      accountSidEncrypted: encrypt(dto.accountSid, key),
      isVerified: false,
    };

    if (dto.authToken) data.authTokenEncrypted = encrypt(dto.authToken, key);
    if (dto.apiKey) data.apiKeyEncrypted = encrypt(dto.apiKey, key);
    if (dto.apiSecret) data.apiSecretEncrypted = encrypt(dto.apiSecret, key);
    if (dto.twimlAppSid) data.twimlAppSid = dto.twimlAppSid;

    this.clients.delete(organizationId);

    if (existing) {
      await this.credRepo.update(existing.id, data);
    } else {
      await this.credRepo.save(this.credRepo.create(data));
    }

    const authMethod = hasApiKey ? 'API Key (Case 2 — production)' : 'Auth Token (Case 1 — testing)';
    return { message: `Credentials saved using ${authMethod}` };
  }

  async testConnection(organizationId: string) {
    const cred = await this.credRepo.findOne({ where: { organizationId } });
    if (!cred) throw new NotFoundException('No credentials configured');

    try {
      const client = await this.getClient(organizationId);
      const account = await client.api.v2010.accounts(
        decrypt(cred.accountSidEncrypted, this.getEncryptionKey())
      ).fetch();

      await this.credRepo.update(cred.id, {
        isVerified: true,
        lastCheckedAt: new Date(),
        accountName: account.friendlyName,
        accountStatus: account.status,
      });

      return {
        connected: true,
        accountName: account.friendlyName,
        accountStatus: account.status,
        accountSid: account.sid,
      };
    } catch (err) {
      this.clients.delete(organizationId);
      await this.credRepo.update(cred.id, { isVerified: false, lastCheckedAt: new Date() });
      throw new BadRequestException(`Connection failed: ${err.message}`);
    }
  }

  async getCredentialStatus(organizationId: string) {
    const cred = await this.credRepo.findOne({ where: { organizationId } });
    if (!cred) return { configured: false };

    const authMethod = (cred.apiKeyEncrypted && cred.apiSecretEncrypted)
      ? 'api_key'   // Case 2 — production recommended
      : 'auth_token'; // Case 1 — testing only

    return {
      configured: true,
      authMethod,
      isVerified: cred.isVerified,
      lastCheckedAt: cred.lastCheckedAt,
      accountName: cred.accountName,
      hasTwimlApp: !!cred.twimlAppSid,
    };
  }

  async getPhoneNumbers(organizationId: string) {
    return this.phoneRepo.find({ where: { organizationId, isActive: true } });
  }

  async syncPhoneNumbers(organizationId: string) {
    const client = await this.getClient(organizationId);
    const cred = await this.credRepo.findOne({ where: { organizationId } });
    const accountSid = decrypt(cred.accountSidEncrypted, this.getEncryptionKey());

    const incoming = await client.incomingPhoneNumbers.list({ limit: 100 });

    for (const num of incoming) {
      const existing = await this.phoneRepo.findOne({
        where: { organizationId, phoneNumber: num.phoneNumber },
      });

      const appUrl = `${this.config.get('APP_URL')}/api/webhooks/twilio`;

      const data = {
        organizationId,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        twilioSid: num.sid,
        capabilities: {
          sms: num.capabilities.sms,
          voice: num.capabilities.voice,
          mms: num.capabilities.mms,
        },
        smsUrl: `${appUrl}/sms?orgId=${organizationId}`,
        voiceUrl: `${appUrl}/voice?orgId=${organizationId}`,
      };

      if (existing) {
        await this.phoneRepo.update(existing.id, data);
      } else {
        await this.phoneRepo.save(this.phoneRepo.create(data));
      }
    }

    return this.getPhoneNumbers(organizationId);
  }

  async generateVoiceToken(organizationId: string, userId: string): Promise<{ token: string }> {
    const cred = await this.credRepo.findOne({ where: { organizationId } });
    if (!cred || !cred.twimlAppSid) {
      throw new BadRequestException('Voice not configured. Set TwiML App SID in Twilio settings.');
    }

    const key = this.getEncryptionKey();
    const accountSid = decrypt(cred.accountSidEncrypted, key);

    let apiKey: string;
    let apiSecret: string;

    if (cred.apiKeyEncrypted && cred.apiSecretEncrypted) {
      apiKey = decrypt(cred.apiKeyEncrypted, key);
      apiSecret = decrypt(cred.apiSecretEncrypted, key);
    } else {
      throw new BadRequestException('API Key and Secret required for browser calling');
    }

    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: userId,
      ttl: 3600,
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: cred.twimlAppSid,
      incomingAllow: true,
    });
    accessToken.addGrant(voiceGrant);

    return { token: accessToken.toJwt() };
  }

  async getUsageStats(organizationId: string) {
    const client = await this.getClient(organizationId);
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

    const records = await client.usage.records.list({
      startDate,
      endDate: today,
      limit: 50,
    });

    return records.map((r) => ({
      category: r.category,
      count: r.count,
      price: r.price,
      priceUnit: r.priceUnit,
      startDate: r.startDate,
      endDate: r.endDate,
    }));
  }
}
