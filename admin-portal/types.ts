export enum UserRole {
  Customer = 'Customer',
  Tradesperson = 'Tradesperson',
}

export enum UserStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Pending = 'Pending',
  Rejected = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  signupDate: string;
  avatarUrl: string;
  trade?: string;
  licenseVerified?: boolean;
  backgroundCheck?: boolean;
}

export enum JobStatus {
  Requested = 'Requested',
  Assigned = 'Assigned',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Stalled = 'Stalled',
}

export interface Job {
  id: string;
  customerName: string;
  tradespersonName: string;
  trade: string;
  status: JobStatus;
  requestTime: string;
  location: string;
}

export enum TransactionType {
  Payment = 'Payment',
  Payout = 'Payout',
  Refund = 'Refund',
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  priority: 'High' | 'Medium' | 'Low';
  status: TicketStatus;
  lastUpdate: string;
}

export interface Dispute {
    id: string;
    jobId: string;
    customer: string;
    tradesperson: string;
    reason: string;
    status: 'Open' | 'Under Review' | 'Resolved';
    openedDate: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: string;
  status: 'Active' | 'Expired';
  usageCount: number;
  limit: number;
}
