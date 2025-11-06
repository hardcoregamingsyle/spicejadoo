import React from 'react';
import { Card } from './ui/Card';

interface RegionSelectorProps {
    onSelect: (region: string) => void;
}

const regions = [
    { name: 'North', description: 'Rich curries, breads, and tandoori.' },
    { name: 'South', description: 'Spicy flavors, rice, lentils, and coconut.' },
    { name: 'East', description: 'Subtle spices, freshwater fish, and sweets.' },
    { name: 'West', description: 'Diverse cuisine with both dry and coastal flavors.' },
];

export const RegionSelector: React.FC<RegionSelectorProps> = ({ onSelect }) => {
    return (
        <div className="max-w-3xl mx-auto animate-fade-in-slow">
            <Card className="text-center">
                <h1 className="text-3xl font-header mb-2">Begin Your Culinary Journey</h1>
                <p className="text-[var(--color-text-body)] mb-8">Select a region of India to explore and master its unique vegan flavors.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {regions.map(region => (
                        <button
                            key={region.name}
                            onClick={() => onSelect(region.name)}
                            className="group p-6 bg-white rounded-lg border-2 border-[var(--color-border)] text-left hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                            <h3 className="text-xl font-header text-[var(--color-text-header)]">{region.name} India</h3>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">{region.description}</p>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};
