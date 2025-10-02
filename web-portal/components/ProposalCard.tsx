
import React from 'react';
// FIX: Import VoteOption as a value, not just a type, to use its enum members.
import type { Proposal } from '../types';
import { ProposalStatus, VoteOption } from '../types';
import { InfoIcon, ClockIcon, CheckCircleIcon } from './IconComponents';

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposal: Proposal, vote: VoteOption) => void;
}

const VoteButton: React.FC<{
  vote: VoteOption;
  label: string;
  onClick: () => void;
  disabled: boolean;
  userVote: VoteOption | null;
}> = ({ vote, label, onClick, disabled, userVote }) => {
  const isSelected = userVote === vote;
  let colors = '';
  
  // FIX: Use enum members for comparison for type safety and consistency.
  switch(vote) {
    case VoteOption.FOR:
        colors = 'border-green-500 hover:bg-green-50 text-green-700';
        break;
    case VoteOption.AGAINST:
        colors = 'border-red-500 hover:bg-red-50 text-red-700';
        break;
    case VoteOption.ABSTAIN:
        colors = 'border-gray-500 hover:bg-gray-100 text-gray-700';
        break;
  }

  // FIX: Use enum members for comparison for type safety and consistency.
  const selectedClasses = isSelected ? `bg-opacity-100 text-white ${vote === VoteOption.FOR ? 'bg-green-500' : vote === VoteOption.AGAINST ? 'bg-red-500' : 'bg-gray-500'}` : colors;
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-center px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-200 ${selectedClasses} ${disabledClasses}`}
    >
      {label}
    </button>
  );
};

const VoteProgressBar: React.FC<{ forVotes: number; againstVotes: number; abstainVotes: number }> = ({ forVotes, againstVotes, abstainVotes }) => {
    const totalVotes = forVotes + againstVotes + abstainVotes;
    if (totalVotes === 0) {
        return <div className="h-3 w-full bg-coop-gray rounded-full"></div>;
    }
    const forPercent = (forVotes / totalVotes) * 100;
    const againstPercent = (againstVotes / totalVotes) * 100;

    return (
        <div className="flex h-3 w-full bg-coop-gray rounded-full overflow-hidden">
            <div style={{ width: `${forPercent}%` }} className="bg-green-500 transition-all duration-500"></div>
            <div style={{ width: `${againstPercent}%` }} className="bg-red-500 transition-all duration-500"></div>
        </div>
    );
};

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVote }) => {
  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const isVotingDisabled = proposal.status === ProposalStatus.CLOSED || !!proposal.userVote;
  
  const endDate = new Date(proposal.endDate);
  const timeRemaining = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-2xl">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-coop-gray-darker">{proposal.title}</h3>
                <div className="flex items-center text-sm text-coop-gray-dark mt-2">
                    <InfoIcon className="mr-2"/>
                    <span>Proposed by: {proposal.proposer}</span>
                </div>
            </div>
            {proposal.status === ProposalStatus.OPEN ? (
                 <div className="flex items-center bg-blue-100 text-coop-blue-dark font-semibold px-3 py-1 rounded-full text-sm">
                    <ClockIcon className="mr-2" />
                    {timeRemaining > 0 ? `${timeRemaining} days left` : 'Closing soon'}
                </div>
            ) : (
                <div className="flex items-center bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-sm">
                    <CheckCircleIcon className="mr-2" />
                    Passed
                </div>
            )}
           
        </div>
        <p className="text-coop-gray-dark mt-4">{proposal.description}</p>
      </div>

      <div className="bg-coop-gray-light px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="col-span-1 md:col-span-2">
                 <VoteProgressBar forVotes={proposal.votesFor} againstVotes={proposal.votesAgainst} abstainVotes={proposal.votesAbstain} />
                 <div className="flex justify-between text-sm mt-2">
                    <span className="text-green-600 font-semibold">{proposal.votesFor} For</span>
                    <span className="text-coop-gray-dark font-semibold">{totalVotes} Total Votes</span>
                    <span className="text-red-600 font-semibold">{proposal.votesAgainst} Against</span>
                 </div>
            </div>
            <div className="col-span-1">
                 {proposal.userVote && (
                    <div className="flex items-center justify-center text-center p-2 rounded-lg bg-coop-gray text-coop-gray-darker font-semibold">
                       <CheckCircleIcon className="mr-2 text-coop-blue"/> You voted: {proposal.userVote}
                    </div>
                 )}
            </div>
        </div>
        {proposal.status === ProposalStatus.OPEN && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* FIX: Use VoteOption enum members instead of string literals to match prop types. */}
                <VoteButton vote={VoteOption.FOR} label="Vote For" onClick={() => onVote(proposal, VoteOption.FOR)} disabled={isVotingDisabled} userVote={proposal.userVote} />
                <VoteButton vote={VoteOption.AGAINST} label="Vote Against" onClick={() => onVote(proposal, VoteOption.AGAINST)} disabled={isVotingDisabled} userVote={proposal.userVote} />
                <VoteButton vote={VoteOption.ABSTAIN} label="Abstain" onClick={() => onVote(proposal, VoteOption.ABSTAIN)} disabled={isVotingDisabled} userVote={proposal.userVote} />
            </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;
