import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-[#0F121A] border border-red-500/50 rounded-lg p-6 w-full max-w-sm m-4 relative text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 className="text-xl font-bold text-red-400 mb-4">{title}</h2>
                <div className="text-gray-300 mb-6">
                    {children}
                </div>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="bg-gray-700/50 text-gray-200 font-bold py-2 px-6 rounded-lg transition-colors hover:bg-gray-600/70"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-red-700"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};