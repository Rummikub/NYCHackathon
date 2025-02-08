import { ChangeEvent, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".txt,.doc,.docx,.pdf"
      />
      <div
        onClick={triggerFileInput}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
        title="Upload File"
      >
        <span className="text-gray-600">🔍</span>
      </div>
    </>
  );
};

export default FileUpload;
