
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadBox } from './components/UploadBox';
import { GardenCanvas } from './components/GardenCanvas';
import { StatsBar } from './components/StatsBar';
import { TreeDetailsModal } from './components/TreeDetailsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import type { Tree, Stats } from './types';

const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
  if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(extension)) return 'text';
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(extension)) return 'code';
  if (['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm'].includes(extension)) return 'media';
  return 'other';
};

const MAX_TREE_GROWTH = 5;

const App: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    verifiedFiles: 0,
    totalSize: 0,
  });
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [waterEventId, setWaterEventId] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        setCanvasDimensions({ width, height });
      }
    });

    resizeObserver.observe(mainContent);
    // Set initial size
    setCanvasDimensions({ width: mainContent.clientWidth, height: mainContent.clientHeight });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleFilesAdded = useCallback((files: FileList) => {
    if (canvasDimensions.width === 0 || canvasDimensions.height === 0) return;
    
    const newTrees: Tree[] = [];
    let newVerifiedFiles = 0;
    let newSize = 0;

    Array.from(files).forEach(file => {
      const isVerified = Math.random() > 0.5;
      if (isVerified) {
        newVerifiedFiles++;
      }
      newSize += file.size;

      newTrees.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: getFileType(file.name),
        x: Math.random() * (canvasDimensions.width * 0.9) + (canvasDimensions.width * 0.05),
        y: canvasDimensions.height,
        targetGrowth: 1,
        maxGrowth: MAX_TREE_GROWTH,
        isVerified,
        seed: Math.random() * 10000,
        branches: Math.floor(Math.random() * 2) + 2,
      });
    });

    setTrees(prevTrees => [...prevTrees, ...newTrees]);
    setStats(prevStats => ({
      totalFiles: prevStats.totalFiles + files.length,
      verifiedFiles: prevStats.verifiedFiles + newVerifiedFiles,
      totalSize: prevStats.totalSize + newSize,
    }));
  }, [canvasDimensions]);

  const handleWaterGarden = useCallback(() => {
    setTrees(prevTrees =>
      prevTrees.map(tree => ({
        ...tree,
        targetGrowth: Math.min(tree.maxGrowth, tree.targetGrowth + 0.5),
        branches: tree.targetGrowth < tree.maxGrowth && Math.random() > 0.7 ? tree.branches + 1 : tree.branches,
      }))
    );
    setWaterEventId(id => id + 1);
  }, []);
  
  const handleTreeMove = useCallback((treeId: string, newX: number) => {
    setTrees(prevTrees => 
      prevTrees.map(tree => 
        tree.id === treeId ? { ...tree, x: newX } : tree
      )
    );
  }, []);

  const handleTreeSelect = useCallback((tree: Tree) => {
    setSelectedTree(tree);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTree(null);
  }, []);
  
  const handleFilesAddedAndCloseSidebar = useCallback((files: FileList) => {
    handleFilesAdded(files);
    setIsSidebarOpen(false);
  }, [handleFilesAdded]);

  const handleClearGarden = useCallback(() => {
    setTrees([]);
    setStats({
      totalFiles: 0,
      verifiedFiles: 0,
      totalSize: 0,
    });
    // FIX: Cannot find name 'animatedTreesRef'. This ref is local to GardenCanvas.
    // GardenCanvas has been updated to handle tree removal when its `trees` prop changes.
    setIsConfirmModalOpen(false);
  }, []);

  return (
    <div className="bg-[#0A0C12] text-white min-h-screen font-sans md:flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden bg-[#0A0C12]/80 backdrop-blur-sm p-2 rounded-lg border border-white/10 text-white"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-sm p-6 flex flex-col gap-6 bg-[#0A0C12]/80 backdrop-blur-sm border-r border-white/10 z-40 transition-transform duration-300 ease-in-out md:relative md:max-w-xs md:h-screen md:translate-x-0 md:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center md:justify-center">
          <Header />
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white" aria-label="Close menu">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <UploadBox onFilesAdded={handleFilesAddedAndCloseSidebar} />
        
        <div className="mt-auto flex flex-col gap-4">
           <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-900/50 text-red-300 border border-red-500/50 rounded-lg py-2 px-4 hover:bg-red-900/80 hover:text-red-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
              <span>Clear Garden</span>
            </button>
           <StatsBar stats={stats} />
        </div>
      </div>
      
      <main ref={mainContentRef} className="flex-1 h-screen relative overflow-hidden">
        <GardenCanvas trees={trees} onTreeSelect={handleTreeSelect} onTreeMove={handleTreeMove} waterEventId={waterEventId} />
      </main>

      {selectedTree && <TreeDetailsModal tree={selectedTree} onClose={handleCloseModal} />}
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleClearGarden}
        title="Clear Garden"
      >
        <p>Are you sure you want to remove all trees from your garden? This action cannot be undone.</p>
      </ConfirmationModal>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-20 pointer-events-none">
        <button
          onClick={handleWaterGarden}
          className="bg-[#50FED5] text-[#0A0C12] font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
          style={{ boxShadow: '0 0 20px 5px rgba(80,254,213,0.3)' }}
        >
          Water Garden
        </button>
      </div>
    </div>
  );
};

export default App;
