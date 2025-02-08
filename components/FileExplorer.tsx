'use client';

import { useState, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaFile } from 'react-icons/fa';

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileSystemItem[];
}

interface FileExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchDirectory = async (path: string) => {
    try {
      const response = await fetch('/api/files?path=' + encodeURIComponent(path));
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setFiles(data.files);
      setCurrentPath(path);
    } catch (err) {
      setError('Failed to fetch directory contents');
    }
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'directory') {
      fetchDirectory(item.path);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDirectory('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-16 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">File Explorer</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div className="p-4 text-red-500">{error}</div>
      )}

      <div className="p-2">
        <div className="text-sm text-gray-500 mb-2">
          {currentPath || 'Root'}
        </div>
        
        {currentPath && (
          <div
            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              const parentPath = currentPath.split('/').slice(0, -1).join('/');
              fetchDirectory(parentPath);
            }}
          >
            <FaFolderOpen className="mr-2" />
            ..
          </div>
        )}

        {files.map((item, index) => (
          <div
            key={index}
            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            {item.type === 'directory' ? (
              <FaFolder className="mr-2 text-yellow-500" />
            ) : (
              <FaFile className="mr-2 text-gray-500" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
