export interface Tree {
  id: string;
  fileName: string;
  fileSize: number;
  x: number;
  y: number;
  targetGrowth: number;
  isVerified: boolean;
  seed: number;
  branches: number;
  fileType: string;
  maxGrowth: number;
}

export interface Stats {
  totalFiles: number;
  verifiedFiles: number;
  totalSize: number;
}