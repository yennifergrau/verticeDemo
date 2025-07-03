export interface Cotizacion {
  fecha: Date;
  datosPropietario: {
    esDuenio: string;
    nombre: string;
    documento: string;
  };
  datosVehiculo: {
    placa: string;
    ano: number;
    marca: string;
    modelo: string;
    tipo: string;
  };
  resultado: {
    primaTotal: {
      euro: number;
      dolar: number;
      bs: number;
    };
    danosPersonas: {
      euro: number;
      dolar: number;
      bs: number;
    };
    danosCosas: {
      euro: number;
      dolar: number;
      bs: number;
    };
  };
}