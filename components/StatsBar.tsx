
import React from 'react';
import type { Stats } from '../types';

interface StatsBarProps {
  stats: Stats;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const StatItem: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
    <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
    </div>
);


export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="w-full bg-[#0F121A] border border-[rgba(80,254,213,0.25)] rounded-lg p-3 sm:p-4">
        <div className="grid grid-cols-3 divide-x divide-[rgba(80,254,213,0.25)]">
            <StatItem label="Total Files" value={stats.totalFiles} color="text-[#50FED5]" />
            <StatItem label="Verified" value={stats.verifiedFiles} color="text-[#7A5CFF]" />
            <StatItem label="Data Size" value={formatBytes(stats.totalSize)} color="text-[#FF6A5A]" />
        </div>
    </div>
  );
};
