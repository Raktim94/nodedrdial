// User types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DEALER = 'dealer',
  ORG_OWNER = 'org_owner',
  MANAGER = 'manager',
  AGENT = 'agent',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  dealerId?: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  dealerId?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
}

// Message types
export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RECEIVED = 'received',
  UNDELIVERED = 'undelivered',
  SCHEDULED = 'scheduled',
}

export interface Message {
  id: string;
  organizationId: string;
  fromNumber: string;
  toNumber: string;
  body: string;
  direction: MessageDirection;
  status: MessageStatus;
  twilioSid?: string;
  campaignId?: string;
  contactId?: string;
  isRead: boolean;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// Call types
export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CallStatus {
  QUEUED = 'queued',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BUSY = 'busy',
  NO_ANSWER = 'no-answer',
  CANCELED = 'canceled',
}

export interface Call {
  id: string;
  organizationId: string;
  fromNumber: string;
  toNumber: string;
  direction: CallDirection;
  status: CallStatus;
  duration?: number;
  twilioSid?: string;
  recordingUrl?: string;
  contactId?: string;
  notes?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

// Contact types
export interface Contact {
  id: string;
  organizationId: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
  customFields: Record<string, string>;
  optedOut: boolean;
  notes?: string;
  createdAt: string;
}

// Campaign types
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum CampaignTargetType {
  ALL = 'all',
  GROUPS = 'groups',
  INDIVIDUAL = 'individual',
}

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  message: string;
  fromNumberId: string;
  status: CampaignStatus;
  targetType: CampaignTargetType;
  targetTags?: string[];
  targetContactIds?: string[];
  totalCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  optOutCount: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  ratePerSecond: number;
  createdAt: string;
}

// Template types
export interface Template {
  id: string;
  organizationId: string;
  name: string;
  body: string;
  category?: string;
  variables: string[];
  usageCount: number;
  createdAt: string;
}

// Notification types
export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  MISSED_CALL = 'missed_call',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  SYSTEM_ALERT = 'system_alert',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

// WebSocket event types
export interface WsMessageEvent {
  message: Message;
  contact?: Pick<Contact, 'id' | 'firstName' | 'lastName' | 'phone'>;
}

export interface WsCallEvent {
  call: Call;
  contact?: Pick<Contact, 'id' | 'firstName' | 'lastName' | 'phone'>;
  voiceToken?: string;
}

export interface WsNotificationEvent {
  notification: Notification;
}

// Dealer types
export interface Dealer {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: string;
}

// Twilio phone number type
export interface PhoneNumber {
  id: string;
  organizationId: string;
  number: string;
  friendlyName?: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  twilioSid: string;
  isActive: boolean;
  createdAt: string;
}

// Webhook types
export interface Webhook {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

// API Key type
export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}
