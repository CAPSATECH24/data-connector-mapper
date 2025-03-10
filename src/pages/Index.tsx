
import React from 'react';
import { FileUpload } from '../components/FileUpload';
import { DataTable } from '../components/DataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Index = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [statistics, setStatistics] = React.useState<any[]>([]);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'arraybuffer' });
      
      // Process each sheet according to mapping
      const processedData: any[] = [];
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        processedData.push(...sheetData);
      });

      setData(processedData);
      
      // Calculate statistics
      const stats = calculateStatistics(processedData);
      setStatistics(stats);

      toast({
        title: "File processed successfully",
        description: `Processed ${processedData.length} records`,
      });
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "Please check the file format and try again",
        variant: "destructive",
      });
    }
  };

  const calculateStatistics = (data: any[]) => {
    // Example statistics calculation
    const stats = Object.entries(
      data.reduce((acc, curr) => {
        const type = curr.Tipo_de_Dispositivo || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    
    return stats;
  };

  const exportData = () => {
    if (data.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processed Data");
    XLSX.writeFile(wb, "exported_data.xlsx");
  };

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 fadeIn">Excel Data Processor</h1>
        <p className="text-lg text-gray-600 slideIn">Upload your Excel file to process and analyze the data</p>
      </div>

      <FileUpload onFileSelect={handleFileSelect} />

      {data.length > 0 && (
        <div className="space-y-8 fadeIn">
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-4">Data Distribution</h2>
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

          <DataTable
            data={data}
            columns={Object.keys(data[0])}
            onExport={exportData}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
