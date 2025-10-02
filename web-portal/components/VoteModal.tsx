
import React from 'react';
import type { VoteOption } from '../types';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  proposalTitle: string;
  voteOption: VoteOption;
}

const VoteModal: React.FC<VoteModalProps> = ({ isOpen, onClose, onConfirm, proposalTitle, voteOption }) => {
  if (!isOpen) return null;

  const voteStyles = {
    FOR: {
      label: "FOR",
      bg: "bg-green-500",
      hoverBg: "hover:bg-green-600",
      ring: "focus:ring-green-500",
    },
    AGAINST: {
      label: "AGAINST",
      bg: "bg-red-500",
      hoverBg: "hover:bg-red-600",
      ring: "focus:ring-red-500",
    },
    ABSTAIN: {
      label: "ABSTAIN",
      bg: "bg-gray-500",
      hoverBg: "hover:bg-gray-600",
      ring: "focus:ring-gray-500",
    },
  };
  
  const style = voteStyles[voteOption];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-coop-gray-darker mb-2">Confirm Your Vote</h2>
          <p className="text-coop-gray-dark mb-4">Are you sure you want to cast your vote?</p>
          <div className="bg-coop-gray-light p-4 rounded-lg border border-coop-gray">
            <p className="text-sm text-coop-gray-dark">Proposal:</p>
            <p className="font-semibold text-coop-gray-darker">{proposalTitle}</p>
            <p className="text-sm text-coop-gray-dark mt-2">Your Vote:</p>
            <p className={`font-bold text-lg ${style.bg.replace('bg-', 'text-')}`}>{style.label}</p>
          </div>
        </div>
        <div className="bg-coop-gray-light px-6 py-4 flex justify-end space-x-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-coop-gray-dark rounded-md text-coop-gray-darker font-semibold hover:bg-coop-gray transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white font-semibold transition-colors ${style.bg} ${style.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.ring}`}
          >
            Confirm Vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteModal;
