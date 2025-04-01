
import { FieldMapping } from './mappings';

// Clean phone numbers function
export const cleanTelefono = (telefono: any): string | null => {
  if (telefono) {
    // Remove all non-digit characters
    const cleaned = String(telefono).replace(/\D/g, '');
    if (cleaned.length > 0) {
      return cleaned;
    }
  }
  return null;
};

// Convert Excel serial date to YYYY-MM-DD format
export const convertExcelDate = (serialDate: any): string | null => {
  if (serialDate === null || serialDate === undefined || serialDate === '') {
    return null;
  }
  
  // Check if it's a numeric value (Excel serial date)
  const numericValue = Number(serialDate);
  if (!isNaN(numericValue)) {
    // Excel dates are number of days since 1900-01-01
    // (except there's a leap year bug, but we don't need to handle that for modern dates)
    const date = new Date(Math.round((numericValue - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }
  
  // If it's already a string, just return it
  return String(serialDate);
};

// Calculate days since last report
export const calculateDaysSinceLastReport = (lastReportDate: string | null): number | null => {
  if (!lastReportDate) return null;
  
  try {
    const lastReport = new Date(lastReportDate);
    const today = new Date();
    
    // Check if the date is valid
    if (isNaN(lastReport.getTime())) return null;
    
    // Calculate difference in milliseconds
    const diffTime = today.getTime() - lastReport.getTime();
    
    // Convert to days and round to nearest integer
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error("Error calculating days since last report:", error);
    return null;
  }
};

// Extract date from filename
export const extractDateFromFilename = (filename: string): string => {
  const match = filename.match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0];
  } else {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
};

// Process data according to mappings
export const processMappedData = (
  sheetData: any[],
  mapping: FieldMapping,
  sheetName: string,
  fechaArchivo: string
): { validData: any[], invalidData: any[] } => {
  const validData: any[] = [];
  const invalidData: any[] = [];
  
  sheetData.forEach(row => {
    // First determine if the row is valid (Cliente_Cuenta is required)
    const requiredField = 'Cliente_Cuenta';
    const columnName = mapping[requiredField];
    const value = columnName ? row[columnName] : null;
    
    if (!value) {
      // If the required field is missing, the row is invalid
      invalidData.push(row);
    } else {
      // Build a valid record
      const record: Record<string, any> = {};
      
      const fields = [
        'Nombre', 'Cliente_Cuenta', 'Tipo_de_Dispositivo', 'IMEI', 'ICCID',
        'Fecha_de_Activacion', 'Fecha_de_Desactivacion', 'Hora_de_Ultimo_Mensaje',
        'Ultimo_Reporte', 'Vehiculo', 'Servicios', 'Grupo', 'Telefono', 'Origen', 'Fecha_Archivo'
      ];
      
      fields.forEach(field => {
        if (field === 'Origen') {
          record[field] = mapping['Origen'];
        } else if (field === 'Fecha_Archivo') {
          record[field] = fechaArchivo;
        } else {
          const columnName = mapping[field];
          if (columnName) {
            let value = row[columnName];
            
            // Apply specific formatting based on field type
            if (field === 'Telefono') {
              value = cleanTelefono(value);
            } else if (field === 'Fecha_de_Activacion' || field === 'Fecha_de_Desactivacion') {
              value = convertExcelDate(value);
            } else if (field === 'Hora_de_Ultimo_Mensaje' || field === 'Ultimo_Reporte') {
              // Check if it could be an Excel date/time value (includes time)
              value = convertExcelDate(value);
            }
            
            record[field] = value;
          } else {
            record[field] = null;
          }
        }
      });
      
      // Calculate days since last report
      record['Dias_Desde_Ultimo_Reporte'] = calculateDaysSinceLastReport(record['Hora_de_Ultimo_Mensaje']);
      
      validData.push(record);
    }
  });
  
  return { validData, invalidData };
};

// Export data to SQLite database file
export const exportToSQLite = (data: any[]): Blob => {
  const SQL = window.SQL;
  
  // Create a new database
  const db = new SQL.Database();
  
  // Create table structure based on first row
  if (data.length > 0) {
    const columns = Object.keys(data[0])
      .map(key => `"${key}" TEXT`)
      .join(', ');
    
    db.run(`CREATE TABLE devices (${columns})`);
    
    // Insert data rows
    data.forEach(row => {
      const keys = Object.keys(row);
      const placeholders = keys.map(() => '?').join(',');
      const values = keys.map(key => (row[key] === null ? null : String(row[key])));
      
      db.run(`INSERT INTO devices VALUES (${placeholders})`, values);
    });
  }
  
  // Export the database to a .db file
  const binaryArray = db.export();
  return new Blob([binaryArray], { type: 'application/x-sqlite3' });
};
