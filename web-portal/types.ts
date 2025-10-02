import { ReactNode } from 'react';

export enum ProposalStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum VoteOption {
  FOR = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN',
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  userVote: VoteOption | null;
  proposer: string;
  endDate: string;
}

export interface User {
  name: string;
  primaryTrade: string;
  specialties: string[];
  avatarUrl: string;
  email: string;
  phone: string;
  address: string;
  rating?: {
    average?: number;
    totalReviews?: number;
  };
}

export type ViewType = 'dashboard' | 'governance' | 'benefits' | 'community' | 'resources' | 'contributions' | 'profile';