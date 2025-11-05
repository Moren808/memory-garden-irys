
import React, { useState, useCallback, useRef } from 'react';

interface UploadBoxProps {
  onFilesAdded: (files: FileList) => void;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [onFilesAdded]);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full max-w-md h-48 bg-[#0F121A] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all duration-300 ${isDragging ? 'border-[#50FED5] bg-opacity-50' : 'border-[rgba(80,254,213,0.25)]'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'scale-100'}`}>
        <p className="text-lg font-semibold text-gray-300">Drop files or click to add</p>
        <p className="text-sm text-gray-500 mt-1">Each file grows a new tree in your garden</p>
      </div>
      {isDragging && <div className="absolute inset-0 bg-[#50FED5] bg-opacity-10 rounded-xl pointer-events-none"></div>}
    </div>
  );
};
