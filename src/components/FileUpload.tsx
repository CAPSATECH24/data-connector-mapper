
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Card } from './ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    onDrop: files => {
      if (files?.[0]) {
        onFileSelect(files[0]);
      }
    }
  });

  return (
    <Card
      {...getRootProps()}
      className={`glass-panel p-8 text-center cursor-pointer transition-all duration-200 
                 ${isDragActive ? 'border-primary border-2' : 'border border-dashed border-gray-300'}`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
      <div className="text-lg font-medium">
        {isDragActive ? (
          <p className="text-primary">Drop the Excel file here</p>
        ) : (
          <p>Drag and drop an Excel file here, or click to select</p>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2">Supports .xlsx and .xls files</p>
    </Card>
  );
};
