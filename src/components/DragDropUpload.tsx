import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image, Video, Music, FileText } from 'lucide-react';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  type: 'image' | 'file';
  currentFile?: File | null;
  currentUrl?: string;
  label?: string;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  accept,
  type,
  currentFile,
  currentUrl,
  label
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    onFileSelect(file);

    // Create preview for images
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setPreview(null);
    onFileSelect(null as any);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return <Video className="w-8 h-8 text-red-500" />;
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) {
      return <Music className="w-8 h-8 text-green-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-8 h-8 text-orange-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          isDragOver
            ? 'border-purple-500 bg-purple-50 scale-105'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {currentFile || preview ? (
          <div className="text-center">
            {type === 'image' && preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-64 rounded-lg shadow-lg"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                {currentFile && getFileIcon(currentFile.name)}
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 truncate max-w-xs">
                    {currentFile?.name || 'File selected'}
                  </p>
                  {currentFile && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(currentFile.size)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
              {type === 'image' ? (
                <Image className="w-8 h-8 text-purple-600" />
              ) : (
                <Upload className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {label || (type === 'image' ? 'Upload Product Image' : 'Upload Product File')}
            </p>
            <p className="text-gray-600 mb-4">
              Drag and drop your {type === 'image' ? 'image' : 'file'} here, or click to browse
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              {type === 'image' ? (
                <>
                  <p>Recommended: JPEG or PNG, 1000 x 1000 pixels</p>
                  <p>Maximum file size: 10MB</p>
                </>
              ) : (
                <>
                  <p>Supported formats: PDF, MP3, MP4, WAV, AVI, JPEG, PNG, ZIP, RAR</p>
                  <p className="font-medium text-green-600">File size: Unlimited</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDropUpload;