
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Card } from './ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Archivos recibidos:', acceptedFiles);
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('Archivo seleccionado:', file.name, file.type);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    onDrop
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
          <p className="text-primary">Suelta el archivo Excel aquí</p>
        ) : (
          <p>Arrastra y suelta un archivo Excel aquí, o haz clic para seleccionar</p>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2">Soporta archivos .xlsx y .xls</p>
    </Card>
  );
};
