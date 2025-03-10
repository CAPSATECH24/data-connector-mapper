
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DataTableProps {
  data: any[];
  columns: string[];
  onExport?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns, onExport }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");

  // Get unique values for filtering
  const getUniqueValues = (column: string) => {
    if (!column) return [];
    const values = data.map(row => row[column])
      .filter((value, index, self) => 
        value !== null && 
        value !== undefined && 
        String(value).trim() !== "" && 
        self.indexOf(value) === index
      );
    return values.sort();
  };

  // Reset filter values when filter column changes
  useEffect(() => {
    setFilterValue("");
  }, [filterColumn]);

  // Apply filters when search term or column filters change
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
    
    // Apply column-specific filter
    if (filterColumn && filterValue) {
      result = result.filter(row => 
        row[filterColumn] !== null && 
        row[filterColumn] !== undefined && 
        String(row[filterColumn]) === filterValue
      );
    }
    
    setFilteredData(result);
  }, [data, searchTerm, filterColumn, filterValue]);

  return (
    <Card className="glass-panel p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          
          <div className="flex gap-2">
            <Select
              value={filterColumn || ""}
              onValueChange={(value) => setFilterColumn(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por columna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ninguna</SelectItem>
                {columns.map(column => (
                  <SelectItem key={column} value={column}>{column}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filterColumn && (
              <Select
                value={filterValue}
                onValueChange={setFilterValue}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar valor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {getUniqueValues(filterColumn).map((value, index) => (
                    <SelectItem key={index} value={String(value)}>
                      {String(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
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
                          ? String(row[column]) 
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
