import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { DataTable } from '../components/DataTable';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { processMappedData, extractDateFromFilename } from '../utils/dataProcessing';
import { defaultMappings } from '../utils/mappings';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [invalidData, setInvalidData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // Process each sheet according to mapping
      const processedData: any[] = [];
      const invalidRecords: any[] = [];
      let recordCount = 0;
      
      const filename = file.name;
      const fechaArchivo = extractDateFromFilename(filename);
      
      workbook.SheetNames.forEach(sheetName => {
        if (defaultMappings[sheetName]) {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet);
          recordCount += sheetData.length;
          
          // Process the data with mappings
          const { validData, invalidData } = processMappedData(
            sheetData, 
            defaultMappings[sheetName], 
            sheetName, 
            fechaArchivo
          );
          
          processedData.push(...validData);
          invalidRecords.push(...invalidData);
        }
      });

      setData(processedData);
      setInvalidData(invalidRecords);
      setTotalRecords(recordCount);
      
      toast({
        title: "Archivo procesado exitosamente",
        description: `Procesados ${processedData.length} registros de ${recordCount} totales`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error al procesar el archivo",
        description: "Por favor verifica el formato del archivo e intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    if (data.length === 0) return;
    
    // Obtenemos la fecha actual en formato DD-MM-YYYY
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    // Creamos el nombre del archivo con la fecha actual
    const fileName = `BD PLATAFORMAS - ${formattedDate}.xlsx`;
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos Procesados");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 fadeIn">Carga y Homologación de Datos desde Excel</h1>
        <p className="text-lg text-gray-600 slideIn">Sube tu archivo Excel para procesar y analizar los datos</p>
      </div>

      <FileUpload onFileSelect={handleFileSelect} />

      {data.length > 0 && (
        <div className="space-y-8 fadeIn">
          {/* General Statistics */}
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-4">Resumen General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Total de Registros en Excel</h3>
                <p className="text-3xl font-bold">{totalRecords}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Registros Procesados</h3>
                <p className="text-3xl font-bold text-green-600">{data.length}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Registros Inválidos</h3>
                <p className="text-3xl font-bold text-red-600">{invalidData.length}</p>
              </div>
            </div>
          </Card>

          {/* All Data Table */}
          <h2 className="text-2xl font-semibold mb-4">Datos Procesados</h2>
          <DataTable
            data={data}
            columns={[
              'Nombre', 'Cliente_Cuenta', 'Tipo_de_Dispositivo', 'IMEI', 'ICCID',
              'Fecha_de_Activacion', 'Fecha_de_Desactivacion', 'Hora_de_Ultimo_Mensaje',
              'Ultimo_Reporte', 'Vehiculo', 'Servicios', 'Grupo', 'Telefono', 'Origen'
            ]}
            onExport={exportData}
          />
          
          {/* Invalid Data Table */}
          {invalidData.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-4 mt-8">Registros Inválidos</h2>
              <Card className="glass-panel p-6">
                <p className="text-gray-600 mb-4">
                  Los siguientes registros son inválidos porque no tienen el campo Cliente_Cuenta requerido:
                </p>
                <DataTable
                  data={invalidData}
                  columns={Object.keys(invalidData[0] || {})}
                />
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
