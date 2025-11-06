import React from 'react';
import { OracleJudgement } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface OracleResponseProps {
  judgement: OracleJudgement;
  onClose: () => void;
}

export const OracleResponse: React.FC<OracleResponseProps> = ({ judgement, onClose }) => {
  const scoreColor = judgement.score >= 8 ? 'text-green-600' : judgement.score >= 5 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-modal-reveal">
            <Card className="!p-8">
                <div className="text-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">The Oracle Has Spoken!</h3>
                    <p className="text-lg text-[var(--color-text-body)] mt-4">You have created...</p>
                    <h4 className="text-4xl font-header text-[var(--color-primary-dark)] mt-1 mb-6">{judgement.dishName}</h4>
                </div>

                <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h5 className="font-bold text-amber-800 mb-1">Oracle's Vision</h5>
                        <p className="text-amber-700 italic">"{judgement.description}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h5 className="font-bold text-gray-800 mb-1">Oracle's Wisdom</h5>
                            <p className="text-[var(--color-text-body)]">{judgement.feedback}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center flex flex-col justify-center items-center border border-gray-100">
                            <h5 className="font-bold text-gray-800 mb-2">Final Score</h5>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-white border-4 ${scoreColor.replace('text-', 'border-')}`}>
                              <p className={`text-5xl font-header ${scoreColor}`}>{judgement.score.toFixed(1)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button onClick={onClose}>
                    Next Challenge
                  </Button>
                </div>
            </Card>
        </div>
    </div>
  );
};