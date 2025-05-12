// Define the default mappings for different sheets

export interface FieldMapping {
  [key: string]: string | null;
}

export interface SheetMappings {
  [sheetName: string]: FieldMapping;
}

export const defaultMappings: SheetMappings = {
  "WIALON": {
    'Nombre': 'Nombre',
    'Cliente_Cuenta': 'Cuenta',
    'Tipo_de_Dispositivo': 'Tipo de dispositivo',
    'IMEI': 'UID',  // Changed from 'IMEI' to 'UID'
    'ICCID': 'Iccid',
    'Fecha_de_Activacion': 'Creada',
    'Fecha_de_Desactivacion': 'Desactivación',
    'Hora_de_Ultimo_Mensaje': 'Hora de último mensaje',
    'Ultimo_Reporte': 'Ultimo Reporte',
    'Vehiculo': null,
    'Servicios': null,
    'Grupo': 'Grupos',
    'Telefono': 'Teléfono',
    'Origen': 'WIALON',  // Assigned manually
    'Fecha_Archivo': null  // Extracted from filename
  },
  "ADAS": {
    'Nombre': 'equipo',
    'Cliente_Cuenta': 'Subordinar',
    'Tipo_de_Dispositivo': 'Modelo',
    'IMEI': 'IMEI',
    'ICCID': 'Iccid',
    'Fecha_de_Activacion': 'Activation Date',
    'Fecha_de_Desactivacion': null,
    'Hora_de_Ultimo_Mensaje': null,
    'Ultimo_Reporte': null,
    'Vehiculo': null,
    'Servicios': null,
    'Grupo': null,
    'Telefono': 'Número de tarjeta SIM',
    'Origen': 'ADAS',  // Assigned manually
    'Fecha_Archivo': null  // Extracted from filename
  },
  "COMBUSTIBLE": {
    'Nombre': 'Vehículo',
    'Cliente_Cuenta': 'Cuenta',
    'Tipo_de_Dispositivo': 'Tanques',
    'IMEI': null,
    'ICCID': null,
    'Fecha_de_Activacion': null,
    'Fecha_de_Desactivacion': null,
    'Hora_de_Ultimo_Mensaje': 'Último reporte',
    'Ultimo_Reporte': null,
    'Vehiculo': 'Vehículo',
    'Servicios': 'Servicios',
    'Grupo': 'Grupos',
    'Telefono': 'Línea',
    'Origen': 'COMBUSTIBLE',  // Assigned manually
    'Fecha_Archivo': null  // Extracted from filename
  }
};
