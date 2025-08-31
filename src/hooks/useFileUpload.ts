import { useState, useCallback } from 'react';
import { UploadedFile } from '../types';

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        // Validate file types and sizes
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain', 'audio/mpeg', 'audio/wav', 'audio/webm'
        ];

        if (file.size > maxSize) {
          setUploadError(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }

        if (!allowedTypes.includes(file.type)) {
          setUploadError(`File type ${file.type} is not supported.`);
          return false;
        }

        return true;
      });

      const newFiles: UploadedFile[] = await Promise.all(
        validFiles.map(async (file) => {
          const uploadedFile: UploadedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size
          };

          // Create preview for images
          if (file.type.startsWith('image/')) {
            uploadedFile.preview = URL.createObjectURL(file);
          }

          // Read text content for text files
          if (file.type === 'text/plain') {
            uploadedFile.content = await file.text();
          }

          return uploadedFile;
        })
      );

      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      // Clean up object URLs to prevent memory leaks
      const removedFile = prev.find(file => file.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updatedFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    // Clean up all object URLs
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadedFiles([]);
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isUploading,
    uploadError,
    handleFileUpload,
    removeFile,
    clearFiles,
    setUploadError
  };
};