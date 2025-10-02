
import React, { useState, useEffect } from 'react';
// FIX: Import VoteOption as a value, not just a type, to use its enum members.
import type { Proposal } from '../types';
import { ProposalStatus, VoteOption } from '../types';
import ProposalCard from './ProposalCard';
import VoteModal from './VoteModal';

const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    title: 'Quarterly Rate Adjustment: +5% for all trades',
    description: 'Proposal to increase the standard hourly rate for all trades by 5% to adjust for inflation and increased material costs. This change will apply to all new jobs accepted after the proposal passes.',
    status: ProposalStatus.OPEN,
    votesFor: 125,
    votesAgainst: 30,
    votesAbstain: 15,
    userVote: null,
    proposer: 'Co-op Rate Committee',
    endDate: '2024-08-15T23:59:59Z',
  },
  {
    id: 'prop-002',
    title: 'New Health Insurance Partner: SelectHealth',
    description: 'Evaluation and vote to switch the cooperative\'s group health insurance provider to SelectHealth, which offers better coverage for dental and vision at a comparable premium.',
    status: ProposalStatus.OPEN,
    votesFor: 88,
    votesAgainst: 52,
    votesAbstain: 20,
    userVote: null,
    proposer: 'Benefits Committee',
    endDate: '2024-08-20T23:59:59Z',
  },
  {
    id: 'prop-003',
    title: 'Investment in New Scheduling Software',
    description: 'Approve a budget of $50,000 for the development and implementation of a new, more efficient scheduling and dispatch algorithm to reduce travel time and increase job capacity.',
    status: ProposalStatus.CLOSED,
    votesFor: 210,
    votesAgainst: 15,
    votesAbstain: 5,
    userVote: VoteOption.FOR,
    proposer: 'Tech Committee',
    endDate: '2024-07-30T23:59:59Z',
  },
];

const Governance: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  useEffect(() => {
    // Simulate API call
    setProposals(mockProposals);
  }, []);

  const handleVoteClick = (proposal: Proposal, vote: VoteOption) => {
    setSelectedProposal(proposal);
    setSelectedVote(vote);
    setIsModalOpen(true);
  };

  const handleConfirmVote = () => {
    if (selectedProposal && selectedVote) {
      setProposals(prevProposals =>
        prevProposals.map(p => {
          if (p.id === selectedProposal.id) {
            // This is a simulation. In a real app, you'd just update userVote
            // and the counts would come from the backend.
            let { votesFor, votesAgainst, votesAbstain } = p;
            if (selectedVote === VoteOption.FOR) votesFor++;
            if (selectedVote === VoteOption.AGAINST) votesAgainst++;
            if (selectedVote === VoteOption.ABSTAIN) votesAbstain++;
            
            return { ...p, userVote: selectedVote, votesFor, votesAgainst, votesAbstain };
          }
          return p;
        })
      );
    }
    setIsModalOpen(false);
    setSelectedProposal(null);
    setSelectedVote(null);
  };
  
  const filteredProposals = proposals.filter(p => activeTab === 'open' ? p.status === ProposalStatus.OPEN : p.status === ProposalStatus.CLOSED);

  return (
    <>
      <div className="mb-6 pb-4 border-b border-coop-gray">
        <div className="inline-flex bg-coop-gray rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('open')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${activeTab === 'open' ? 'bg-white text-coop-blue-dark shadow' : 'text-coop-gray-dark'}`}
          >
            Open for Voting
          </button>
          <button 
            onClick={() => setActiveTab('closed')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${activeTab === 'closed' ? 'bg-white text-coop-blue-dark shadow' : 'text-coop-gray-dark'}`}
          >
            Voting History
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {filteredProposals.length > 0 ? (
          filteredProposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} onVote={handleVoteClick} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-coop-gray-dark">No {activeTab} proposals found.</p>
          </div>
        )}
      </div>
      {selectedProposal && selectedVote && (
        <VoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmVote}
          proposalTitle={selectedProposal.title}
          voteOption={selectedVote}
        />
      )}
    </>
  );
};

export default Governance;
