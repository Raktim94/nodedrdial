import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto, UpdateContactDto, ListContactsDto, ImportContactsDto } from './dto/contacts.dto';
import { paginate, getPaginationOffset } from '../../common/utils/pagination.util';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
  ) {}

  async create(organizationId: string, dto: CreateContactDto) {
    const contact = this.contactRepo.create({ ...dto, organizationId });
    return this.contactRepo.save(contact);
  }

  async findAll(organizationId: string, query: ListContactsDto) {
    const { page = 1, limit = 50, search, tags, isOptedOut } = query;
    const { skip, take } = getPaginationOffset(page, limit);

    let qb = this.contactRepo.createQueryBuilder('c')
      .where('c.organization_id = :orgId', { orgId: organizationId })
      .orderBy('c.created_at', 'DESC')
      .skip(skip)
      .take(take);

    if (search) {
      qb = qb.andWhere(
        '(c.first_name ILIKE :s OR c.last_name ILIKE :s OR c.email ILIKE :s OR c.phone ILIKE :s OR c.company ILIKE :s)',
        { s: `%${search}%` }
      );
    }

    if (tags?.length) {
      qb = qb.andWhere('c.tags && :tags', { tags });
    }

    if (isOptedOut !== undefined) {
      qb = qb.andWhere('c.is_opted_out = :isOptedOut', { isOptedOut });
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(organizationId: string, id: string) {
    const contact = await this.contactRepo.findOne({ where: { id, organizationId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(organizationId: string, id: string, dto: UpdateContactDto) {
    const contact = await this.findOne(organizationId, id);
    Object.assign(contact, dto);
    return this.contactRepo.save(contact);
  }

  async remove(organizationId: string, id: string) {
    const contact = await this.findOne(organizationId, id);
    await this.contactRepo.remove(contact);
    return { message: 'Contact deleted' };
  }

  async bulkDelete(organizationId: string, ids: string[]) {
    await this.contactRepo.delete({ organizationId, id: In(ids) });
    return { message: `${ids.length} contacts deleted` };
  }

  async importCsv(organizationId: string, csvBuffer: Buffer) {
    const rows = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        const phone = (row.phone || row.Phone || row.PHONE || '').trim();
        if (!phone) { results.errors.push(`Row missing phone: ${JSON.stringify(row)}`); continue; }

        const existing = await this.contactRepo.findOne({ where: { organizationId, phone } });
        const data = {
          organizationId,
          firstName: row.first_name || row['First Name'] || row.firstName || '',
          lastName: row.last_name || row['Last Name'] || row.lastName || '',
          email: row.email || row.Email || '',
          phone,
          company: row.company || row.Company || '',
          tags: (row.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        };

        if (existing) {
          await this.contactRepo.update(existing.id, data);
          results.updated++;
        } else {
          await this.contactRepo.save(this.contactRepo.create(data));
          results.created++;
        }
      } catch (err) {
        results.errors.push(`Error processing row: ${err.message}`);
      }
    }

    return results;
  }

  async exportCsv(organizationId: string): Promise<Buffer> {
    const contacts = await this.contactRepo.find({
      where: { organizationId },
      order: { firstName: 'ASC' },
    });

    const csvData = stringify(contacts.map((c) => ({
      first_name: c.firstName,
      last_name: c.lastName || '',
      email: c.email || '',
      phone: c.phone,
      company: c.company || '',
      tags: (c.tags || []).join(','),
      city: c.city || '',
      country: c.country || '',
      opted_out: c.isOptedOut,
      created_at: c.createdAt.toISOString(),
    })), { header: true });

    return Buffer.from(csvData);
  }

  async getAllTags(organizationId: string): Promise<string[]> {
    const contacts = await this.contactRepo.find({
      where: { organizationId },
      select: ['tags'],
    });
    const tags = new Set<string>();
    contacts.forEach((c) => (c.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }

  async optOut(organizationId: string, phone: string) {
    const contact = await this.contactRepo.findOne({ where: { organizationId, phone } });
    if (contact) {
      await this.contactRepo.update(contact.id, { isOptedOut: true, optedOutAt: new Date() });
    }
  }
}
