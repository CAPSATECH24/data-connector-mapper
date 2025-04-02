
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

interface DataTableProps {
  data: any[];
  columns: string[];
  onExport?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns, onExport }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [displayData, setDisplayData] = useState<any[]>([]);

  // Calculate days since last report
  useEffect(() => {
    if (filteredData.length > 0) {
      const today = new Date();
      const newDisplayData = filteredData.map(row => {
        const newRow = { ...row };
        
        // Add DiasDesdeUltimoReporte column if Hora_de_Ultimo_Mensaje exists
        if (row.Hora_de_Ultimo_Mensaje) {
          try {
            // Parse date format like "01.04.2025 08:24:18"
            const parts = row.Hora_de_Ultimo_Mensaje.split(' ');
            if (parts.length >= 1) {
              const dateParts = parts[0].split('.');
              if (dateParts.length === 3) {
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed in JS
                const year = parseInt(dateParts[2], 10);
                
                const lastReportDate = new Date(year, month, day);
                
                // Calculate difference in days
                const diffTime = today.getTime() - lastReportDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                newRow.DiasDesdeUltimoReporte = diffDays;
              } else {
                newRow.DiasDesdeUltimoReporte = null;
              }
            } else {
              newRow.DiasDesdeUltimoReporte = null;
            }
          } catch (error) {
            console.error("Error parsing date:", error);
            newRow.DiasDesdeUltimoReporte = null;
          }
        } else {
          newRow.DiasDesdeUltimoReporte = null;
        }
        
        return newRow;
      });
      
      setDisplayData(newDisplayData);
    } else {
      setDisplayData([]);
    }
  }, [filteredData]);

  // Apply filters when search term changes
  useEffect(() => {
    let result = [...data];
    
    // Apply search across all columns
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          value !== null && value !== undefined && 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredData(result);
  }, [data, searchTerm]);

  // Create expanded columns list including the new DiasDesdeUltimoReporte column
  const expandedColumns = [...columns];
  if (!expandedColumns.includes('DiasDesdeUltimoReporte') && columns.includes('Hora_de_Ultimo_Mensaje')) {
    const horaIndex = expandedColumns.indexOf('Hora_de_Ultimo_Mensaje');
    expandedColumns.splice(horaIndex + 1, 0, 'DiasDesdeUltimoReporte');
  }

  return (
    <Card className="glass-panel p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
        
        {onExport && (
          <Button onClick={onExport} variant="outline" className="whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {expandedColumns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((row, i) => (
                  <TableRow key={i}>
                    {expandedColumns.map((column) => (
                      <TableCell key={column}>
                        {row[column] !== null && row[column] !== undefined 
                          ? String(row[column]) 
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={expandedColumns.length} className="text-center py-4">
                    No hay datos que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        Mostrando {displayData.length} de {data.length} registros
      </div>
    </Card>
  );
};
