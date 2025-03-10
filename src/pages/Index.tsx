
import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { DataTable } from '../components/DataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { processMappedData, cleanTelefono, extractDateFromFilename } from '../utils/dataProcessing';
import { defaultMappings } from '../utils/mappings';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [invalidData, setInvalidData] = useState<any[]>([]);
  const [insertedData, setInsertedData] = useState<any[]>([]);
  const [notInsertedData, setNotInsertedData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [sheetStatistics, setSheetStatistics] = useState<Record<string, any>>({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState("");
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
      
      // Calculate statistics and set inserted/not inserted (simulating DB functionality)
      const stats = calculateStatistics(processedData);
      const sheetStats = calculateSheetStatistics(processedData);
      
      setStatistics(stats);
      setSheetStatistics(sheetStats);
      setInsertedData(processedData); // In a real app with DB, this would be different
      setNotInsertedData([]); // In a real app with DB, this would have duplicates
      
      if (processedData.length > 0) {
        setSelectedSheet(Object.keys(defaultMappings)[0]);
      }

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

  const calculateStatistics = (data: any[]) => {
    // Process by platform type (Origen)
    const stats = Object.entries(
      data.reduce((acc, curr) => {
        const type = curr.Origen || 'Desconocido';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    
    return stats;
  };

  const calculateSheetStatistics = (allData: any[]) => {
    const sheets = Object.keys(defaultMappings);
    const result: Record<string, any> = {};
    
    for (const sheet of sheets) {
      const sheetData = allData.filter(record => record.Origen === sheet);
      const totalSheet = sheetData.length;
      const percentage = (totalSheet / allData.length * 100) || 0;
      
      // Field completeness statistics
      const fieldStats: any[] = [];
      const omittedData: any[] = [];
      
      if (totalSheet > 0) {
        const fields = [
          'Nombre', 'Cliente_Cuenta', 'Tipo_de_Dispositivo', 'IMEI', 'ICCID',
          'Fecha_de_Activacion', 'Fecha_de_Desactivacion', 'Hora_de_Ultimo_Mensaje',
          'Ultimo_Reporte', 'Vehiculo', 'Servicios', 'Grupo', 'Telefono'
        ];
        
        for (const field of fields) {
          const nonEmpty = sheetData.filter(record => 
            record[field] !== null && 
            record[field] !== undefined && 
            String(record[field]).trim() !== ""
          ).length;
          
          const empty = totalSheet - nonEmpty;
          const completionPercentage = (nonEmpty / totalSheet) * 100;
          
          fieldStats.push({
            Campo: field,
            "Registros con Datos": nonEmpty,
            "Registros sin Datos": empty,
            "Porcentaje Completitud": `${completionPercentage.toFixed(1)}%`,
            Porcentaje_Num: parseFloat(completionPercentage.toFixed(1))
          });
          
          if (empty > 0) {
            omittedData.push({
              Campo: field,
              "Registros Omitidos": empty,
              "Porcentaje Omitido": `${((empty/totalSheet)*100).toFixed(1)}%`,
              Porcentaje_Num: parseFloat(((empty/totalSheet)*100).toFixed(1))
            });
          }
        }
      }
      
      result[sheet] = {
        totalRecords: totalSheet,
        percentage: percentage.toFixed(1),
        fieldStats: fieldStats,
        omittedData: omittedData,
        mappedFields: Object.values(defaultMappings[sheet]).filter(v => v !== null).length,
        data: sheetData
      };
    }
    
    return result;
  };

  const exportData = () => {
    if (data.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos Procesados");
    XLSX.writeFile(wb, "datos_exportados.xlsx");
  };

  const exportSheetData = (sheetName: string, sheetData: any[]) => {
    if (sheetData.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}_datos.xlsx`);
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Total de Registros</h3>
                <p className="text-3xl font-bold">{totalRecords}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Registros Insertados</h3>
                <p className="text-3xl font-bold text-green-600">{insertedData.length}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Registros No Insertados</h3>
                <p className="text-3xl font-bold text-yellow-600">{notInsertedData.length}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow text-center">
                <h3 className="text-gray-500 text-sm font-medium">Registros Inválidos</h3>
                <p className="text-3xl font-bold text-red-600">{invalidData.length}</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Distribución de Registros por Plataforma</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Platform Tabs */}
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-4">Análisis por Plataforma</h2>
            
            <Tabs 
              value={selectedSheet} 
              onValueChange={setSelectedSheet} 
              className="w-full"
            >
              <TabsList className="mb-4">
                {Object.keys(defaultMappings).map(sheetName => (
                  <TabsTrigger 
                    key={sheetName} 
                    value={sheetName} 
                    className="px-4 py-2"
                  >
                    {sheetName}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.keys(defaultMappings).map(sheetName => {
                const sheetData = sheetStatistics[sheetName] || { 
                  totalRecords: 0, 
                  percentage: "0.0",
                  fieldStats: [],
                  omittedData: [],
                  mappedFields: 0,
                  data: []
                };
                
                return (
                  <TabsContent key={sheetName} value={sheetName}>
                    <div className="space-y-6">
                      {/* Sheet Summary */}
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Resumen de la Plataforma</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="p-4 bg-white rounded-lg shadow text-center">
                            <h4 className="text-gray-500 text-sm font-medium">Total Registros</h4>
                            <p className="text-2xl font-bold">{sheetData.totalRecords}</p>
                          </div>
                          <div className="p-4 bg-white rounded-lg shadow text-center">
                            <h4 className="text-gray-500 text-sm font-medium">Porcentaje del Total</h4>
                            <p className="text-2xl font-bold">{sheetData.percentage}%</p>
                          </div>
                          <div className="p-4 bg-white rounded-lg shadow text-center">
                            <h4 className="text-gray-500 text-sm font-medium">Campos Mapeados</h4>
                            <p className="text-2xl font-bold">{sheetData.mappedFields}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Field Mapping */}
                        <div className="col-span-1">
                          <h3 className="text-xl font-semibold mb-3">Mapeo de Campos</h3>
                          <div className="bg-white rounded-lg shadow p-4">
                            <DataTable
                              data={Object.entries(defaultMappings[sheetName]).map(([field, mappedField]) => ({
                                Campo: field,
                                Mapeo: mappedField || "No disponible",
                                Estado: mappedField ? "✅ Mapeado" : "❌ No mapeado"
                              }))}
                              columns={['Campo', 'Mapeo', 'Estado']}
                            />
                          </div>
                        </div>

                        {/* Field Statistics */}
                        <div className="col-span-2">
                          <h3 className="text-xl font-semibold mb-3">Estadísticas de Datos</h3>
                          
                          {sheetData.totalRecords > 0 ? (
                            <div className="space-y-6">
                              <div className="bg-white rounded-lg shadow p-4">
                                <DataTable
                                  data={sheetData.fieldStats}
                                  columns={['Campo', 'Registros con Datos', 'Registros sin Datos', 'Porcentaje Completitud']}
                                />
                              </div>
                              
                              {sheetData.omittedData.length > 0 && (
                                <>
                                  <h4 className="text-lg font-semibold mt-6 mb-3">Visualización de Datos Omitidos</h4>
                                  <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={sheetData.omittedData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="Campo" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="Porcentaje_Num" name="Porcentaje Omitido" fill="#f87171" />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="p-6 text-center bg-gray-50 rounded-lg">
                              <p className="text-gray-500">No hay datos para analizar en esta plataforma</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Data Details */}
                      {sheetData.data.length > 0 && (
                        <div>
                          <Separator className="my-6" />
                          <h3 className="text-xl font-semibold mb-3">Datos Detallados</h3>
                          <DataTable
                            data={sheetData.data}
                            columns={[
                              'Nombre', 'Cliente_Cuenta', 'Tipo_de_Dispositivo', 'IMEI', 'ICCID',
                              'Fecha_de_Activacion', 'Fecha_de_Desactivacion', 'Hora_de_Ultimo_Mensaje',
                              'Ultimo_Reporte', 'Vehiculo', 'Servicios', 'Grupo', 'Telefono'
                            ]}
                            onExport={() => exportSheetData(sheetName, sheetData.data)}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </Card>

          {/* All Data Table */}
          <DataTable
            data={data}
            columns={[
              'Nombre', 'Cliente_Cuenta', 'Tipo_de_Dispositivo', 'IMEI', 'ICCID',
              'Fecha_de_Activacion', 'Fecha_de_Desactivacion', 'Hora_de_Ultimo_Mensaje',
              'Ultimo_Reporte', 'Vehiculo', 'Servicios', 'Grupo', 'Telefono', 'Origen'
            ]}
            onExport={exportData}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
