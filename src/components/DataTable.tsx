
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

interface DataTableProps {
  data: any[];
  columns: string[];
  onExport?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);

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

  // Determine if a value is a date (for formatting)
  const isDateValue = (columnName: string): boolean => {
    return columnName.toLowerCase().includes('fecha') || 
           columnName.toLowerCase().includes('hora') || 
           columnName.toLowerCase().includes('reporte');
  };

  // Format date value for display
  const formatDateValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    
    // Try to parse as date
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    } catch (e) {
      // Not a valid date, continue with normal formatting
    }
    
    return String(value);
  };

  return (
    <Card className="glass-panel p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      
      <div className="overflow-x-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {row[column] !== null && row[column] !== undefined 
                          ? isDateValue(column) 
                            ? formatDateValue(row[column])
                            : String(row[column]) 
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-4">
                    No hay datos que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        Mostrando {filteredData.length} de {data.length} registros
      </div>
    </Card>
  );
};
