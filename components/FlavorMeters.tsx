import React from 'react';
import { FlavorProfile, Flavor } from '../types';
import { Card } from './ui/Card';

interface FlavorMetersProps {
  currentProfile: FlavorProfile;
  targetProfile: FlavorProfile;
}

const flavorColors: { [key in Flavor]: string } = {
  [Flavor.HEAT]: 'bg-red-500',
  [Flavor.EARTHY]: 'bg-yellow-600',
  [Flavor.SWEET]: 'bg-pink-400',
  [Flavor.TANGY]: 'bg-lime-500',
  [Flavor.AROMATIC]: 'bg-purple-500',
};


const FlavorMeter: React.FC<{ flavor: Flavor, value: number, target: number }> = ({ flavor, value, target }) => {
    const MAX_VALUE = 150;
    const width = Math.min((value / MAX_VALUE) * 100, 100);
    const targetPos = Math.min((target / MAX_VALUE) * 100, 100);

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-[var(--color-text-header)]">{flavor}</span>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{Math.round(value)} / {target}</span>
            </div>
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full ${flavorColors[flavor]} transition-all duration-500 ease-out`}
                    style={{ width: `${width}%` }}
                ></div>
                <div 
                    className="absolute -top-1 w-1 h-5 bg-gray-600 rounded-full"
                    style={{ 
                      left: `calc(${targetPos}% - 2px)`,
                      boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                    }}
                    title={`Target: ${target}`}
                />
            </div>
        </div>
    );
};


export const FlavorMeters: React.FC<FlavorMetersProps> = ({ currentProfile, targetProfile }) => {
  return (
    <Card>
      <h3 className="text-lg font-header mb-4">Flavor Profile</h3>
      <div className="space-y-4">
        {Object.values(Flavor).map(flavorKey => {
            return (
              <FlavorMeter 
                key={flavorKey} 
                flavor={flavorKey} 
                value={currentProfile[flavorKey]}
                target={targetProfile[flavorKey]}
              />
            )
        })}
      </div>
    </Card>
  );
};