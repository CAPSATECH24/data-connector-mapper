
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
            if (field === 'Telefono') {
              value = cleanTelefono(value);
            }
            record[field] = value;
          } else {
            record[field] = null;
          }
        }
      });
      
      validData.push(record);
    }
  });
  
  return { validData, invalidData };
};
