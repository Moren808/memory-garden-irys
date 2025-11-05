import React from 'react';
import type { Tree } from '../types';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface TreeDetailsModalProps {
    tree: Tree;
    onClose: () => void;
}

export const TreeDetailsModal: React.FC<TreeDetailsModalProps> = ({ tree, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[#0F121A] border border-[rgba(80,254,213,0.25)] rounded-lg p-6 w-full max-w-sm m-4 relative text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 className="text-xl font-bold text-[#50FED5] mb-4">Tree Details</h2>
                <div className="space-y-3 text-sm">
                    <div>
                        <p className="text-gray-400 uppercase text-xs tracking-wider">File Name</p>
                        <p className="font-mono break-all">{tree.fileName}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 uppercase text-xs tracking-wider">File Type</p>
                        <p className="font-semibold capitalize">{tree.fileType}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 uppercase text-xs tracking-wider">File Size</p>
                        <p className="font-semibold text-[#FF6A5A]">{formatBytes(tree.fileSize)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 uppercase text-xs tracking-wider">Status</p>
                        <p className={`font-semibold ${tree.isVerified ? 'text-[#7A5CFF]' : 'text-gray-500'}`}>
                            {tree.isVerified ? 'Verified' : 'Not Verified'}
                        </p>
                    </div>
                     <div>
                        <p className="text-gray-400 uppercase text-xs tracking-wider">Branches</p>
                        <p className="font-semibold">{tree.branches}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};