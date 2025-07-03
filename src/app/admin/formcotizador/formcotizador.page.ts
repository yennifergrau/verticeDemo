import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerComponent } from 'src/app/shared/components/spinner.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { GetsetService } from 'src/app/shared/services/getset.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { forkJoin } from 'rxjs';
import { EmissionService } from 'src/app/shared/services/emission.service';

@Component({
  selector: 'app-formcotizador',
  templateUrl: './formcotizador.page.html',
  styleUrls: ['./formcotizador.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    NgxMaskDirective,
    HttpClientModule,
  ],
  providers: [
    provideNgxMask(),
    GetsetService,
    PaymentService,
    EmissionService
  ]
})
export class FormcotizadorPage implements OnInit {

  private _paymentService = inject(PaymentService)
  private _emissionService = inject(EmissionService)

  
  
  dollarRate: number = 1;
  dollarRat: number = 1;
  incluirGrua: boolean = false;

  esDuenio: boolean = true;
  policy_holder: string = '';
  policy_holder_document_number: string = '';
  policy_holder_phone: string = '';
  policy_holder_email: string = '';
  policy_holder_state: string = '';
  policy_holder_city: string = '';
  policy_holder_municipality: string = '';
  policy_holder_address: string = '';

  insured: string = '';
  insured_document: string = '';
  insured_phone: string = '';
  insured_email: string = '';
  insured_state: string = '';
  insured_city: string = '';
  insured_municipality: string = '';
  insured_address: string = '';

  owner_name: string = '';
  owner_document: string = '';
  owner_phone: string = '';
  owner_email: string = '';
  owner_state: string = '';
  owner_city: string = '';
  owner_municipality: string = '';
  owner_address: string = '';

  placa: string = '';
  ano: number | null = null;
  marca: string = '';
  modelo: string = '';
  version: string = '';
  tipoVehiculo: string = '';
  subtipo: string = '';
  subtipoCarga: string = '';
  uso: string = '';
  number_plate: string = '';
  number_serial : string = '';
  number_motor !: string;
  color !: string;
  transmision !: string;
  gearbox:string = ''
  passenger_qty : string = '';
  peligroso: boolean = false;
  oficial: boolean = false;
  remolque: boolean = false;
  siniestro: boolean = false;
  descuento: boolean = false;
  showSubtipo: boolean = false;
  showCarga: boolean = false;
  showUso: boolean = true;
  showLoading: boolean = false;
  mostrarResultado: boolean = false;
  totalEuro: number = 0;
  totalUSD: number = 0;
  totalBs: number = 0;
  coberturaDatos: any = { cosas: 0, personas: 0 };
  coberturaDolar: any = { cosas: '0', personas: '0' };
  coberturaBs: any = { cosas: '0', personas: '0' };

  constructor(
    private cotizacionService: GetsetService,
    private router: Router,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    forkJoin({
      dollarRate: this._paymentService.getTasaBank(),
    }).subscribe({
      next: (results) => {
        this.dollarRate = results.dollarRate.find(({ code }: any) => {
          return code === 'EUR';
        }).rate;
        this.dollarRat = results.dollarRate.find(({ code }: any) => {
          return code === 'USD';
        }).rate;
      },
      error: () => {
        this.mostrarToast(
          'No se pudo recuperar la información del servidor',
          'toast-error'
        );
      },
    });
  }

  private mostrarToast(mensaje: string, estilo: string) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    toastContainer.innerHTML = '';

    const toast = this.renderer.createElement('div');
    this.renderer.addClass(toast, estilo);

    const toastContent = this.renderer.createElement('div');
    this.renderer.addClass(toastContent, 'toast-content');

    const icon = this.renderer.createElement('span');
    this.renderer.addClass(icon, 'toast-icon');

    const errorIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    const successIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;

    if (estilo === 'toast-error') {
      this.renderer.setProperty(icon, 'innerHTML', errorIconSVG);
    } else if (estilo === 'toast-success') {
      this.renderer.setProperty(icon, 'innerHTML', successIconSVG);
    }

    const text = this.renderer.createElement('span');
    this.renderer.setProperty(text, 'innerHTML', mensaje);
    this.renderer.appendChild(toastContent, icon);
    this.renderer.appendChild(toastContent, text);
    this.renderer.appendChild(toast, toastContent);
    this.renderer.appendChild(toastContainer, toast);

    setTimeout(() => {
      this.renderer.removeChild(toastContainer, toast);
    }, 6000);
  }

  public toggleDatosTomador() {
    if (this.esDuenio) {
      this.owner_name = this.insured;
      this.owner_document = this.insured_document;
      this.owner_phone = this.insured_phone;
      this.owner_email = this.insured_email;
      this.owner_state = this.insured_state;
      this.owner_city = this.insured_city;
      this.owner_municipality = this.insured_municipality;
      this.owner_address = this.insured_address;
    } else {
      this.owner_name = '';
      this.owner_document = '';
      this.owner_phone = '';
      this.owner_email = '';
      this.owner_state = '';
      this.owner_city = '';
      this.owner_municipality = '';
      this.owner_address = '';
      
      this.insured = '';
      this.insured_document = '';
      this.insured_phone = '';
      this.insured_email = '';
      this.insured_state = '';
      this.insured_city = '';
      this.insured_municipality = '';
      this.insured_address = '';
    }
  }

  public onTipoVehiculoChange() {
  const tipo = this.tipoVehiculo;
  this.showSubtipo = tipo === 'autobus' || tipo === 'minibus';
  this.showCarga = tipo === 'carga';
  const sinUso = ['autobus', 'minibus', 'carga', 'ruta', 'rustico', 'moto', 'motocarro', 'sangre', 'maquina'];
  this.showUso = !sinUso.includes(tipo);

  if (!this.showSubtipo) this.subtipo = '';
  if (!this.showCarga) this.subtipoCarga = '';
  this.incluirGrua = false;
}

  public onSubmit() {

  // if (!this.placa || !this.tipoVehiculo) {
  //   this.mostrarToast('Por favor complete todos los campos', 'toast-error');
  //   return;
  // }

  // if (this.esDuenio) {
  //   if (!this.policy_holder || !this.policy_holder_document_number) {
  //     this.mostrarToast('Por favor complete los datos del propietario', 'toast-error');
  //     return;
  //   }
  // } else {
  //   if (!this.insured || !this.insured_document || !this.owner_name || !this.owner_document ) {
  //     this.mostrarToast('Por favor complete los datos del tomador y asegurado', 'toast-error');
  //     return;
  //   }
  // }

  let claseGrupo = this.calcularClaseGrupo();
  const tarifas = this.getTarifas();
  const coberturas = this.getCoberturas();

  const tipoPlaca = this.placa === 'extranjera' ? 'extranjera' : 'nacional';
  const data = tarifas[claseGrupo as keyof typeof tarifas];
  const coberturaData = coberturas[claseGrupo as keyof typeof coberturas];

  if (!data || !coberturaData) {
    this.mostrarToast('No se encontraron tarifas para este tipo de vehículo', 'toast-error');
    return;
  }

  let primaEUR = data.primaAnualEUR;
  if (tipoPlaca === "extranjera" && data.extranjera) {
    primaEUR = data.extranjera.primaAnualEUR;
  }

  const factorConversion = this.dollarRate / this.dollarRat;
  const tasaDolarBs = this.dollarRat;
  let primaUSD = primaEUR * factorConversion;
  
  if (this.incluirGrua && typeof data.servicioGruaUSD === 'number' && data.servicioGruaUSD > 0) {
    primaUSD += data.servicioGruaUSD;
  }

  const danosCosasUSD = coberturaData.danosCosasEUR * factorConversion;
  const danosPersonasUSD = coberturaData.danosPersonasEUR * factorConversion;

  const ajustes: number[] = [];
  if (this.peligroso) ajustes.push(100);
  if (this.oficial) ajustes.push(60);
  if (this.remolque) ajustes.push(20);
  if (this.siniestro) ajustes.push(20);
  if (this.descuento) ajustes.push(-40);

  let totalUSD = primaUSD;
  ajustes.forEach((ajuste) => {
    totalUSD += (totalUSD * ajuste) / 100;
  });

  totalUSD = parseFloat(totalUSD.toFixed(2));
  const totalBs = parseFloat((totalUSD * tasaDolarBs).toFixed(2));
  const totalEuro = parseFloat((totalUSD / factorConversion).toFixed(2));

  // Set results
  this.totalEuro = totalEuro;
  this.totalUSD = totalUSD;
  this.totalBs = totalBs;
  
  this.coberturaDatos = {
    cosas: coberturaData.danosCosasEUR,
    personas: coberturaData.danosPersonasEUR
  };
  
  this.coberturaDolar = {
    cosas: danosCosasUSD.toFixed(2),
    personas: danosPersonasUSD.toFixed(2)
  };
  
  this.coberturaBs = {
    cosas: (danosCosasUSD * tasaDolarBs).toFixed(2),
    personas: (danosPersonasUSD * tasaDolarBs).toFixed(2)
  };

  this.mostrarResultado = true;
  this.guardarCotizacion(totalEuro, totalUSD, totalBs);
}

  public mostrarOpcionGrua(): boolean {
  const claseGrupo = this.calcularClaseGrupo();
  const tarifas = this.getTarifas();
  const data = tarifas[claseGrupo as keyof typeof tarifas];
  
  return data && typeof data.servicioGruaUSD === 'number' && data.servicioGruaUSD > 0;
}

private guardarCotizacion(totalEuro: number, totalUSD: number, totalBs: number) {
  const cotizacion: any = {
    resultado: {
      primaTotal: { 
        euro: totalEuro, 
        dolar: totalUSD, 
        bs: totalBs 
      },
      danosPersonas: { 
        euro: this.coberturaDatos.personas, 
        dolar: parseFloat(this.coberturaDolar.personas), 
        bs: parseFloat(this.coberturaBs.personas) 
      },
      danosCosas: { 
        euro: this.coberturaDatos.cosas, 
        dolar: parseFloat(this.coberturaDolar.cosas), 
        bs: parseFloat(this.coberturaBs.cosas) 
      }
    }
  };

  const mainForm = {
    esDuenio: this.esDuenio,
    orden_id: '',
    carData: {
      type_plate: this.placa,
      plate: this.number_plate,
      brand: this.marca,
      model: this.modelo,
      version: this.version,
      year: this.ano,
      color: this.color,
      gearbox: this.gearbox,
      carroceria_serial_number: this.number_serial,
      motor_serial_number: this.number_motor,
      type_vehiculo: this.tipoVehiculo,
      use: this.subtipoCarga || this.subtipo || this.uso || '',
      passenger_qty: this.passenger_qty,
      driver: this.policy_holder || this.owner_name,
      use_grua: this.incluirGrua
    },
    generalData: {
      policy_holder_document_number: this.esDuenio ? this.policy_holder_document_number : this.insured_document,
      policy_holder: this.esDuenio ? this.policy_holder : this.insured,
      policy_holder_address: this.esDuenio ? this.policy_holder_address : this.insured_address,
      policy_holder_state: this.esDuenio ? this.policy_holder_state : this.insured_state,
      policy_holder_city: this.esDuenio ? this.policy_holder_city : this.insured_city,
      policy_holder_municipality: this.esDuenio ? this.policy_holder_municipality : this.insured_municipality,
      isseur_store: 'COBRETAG C.A',
    },
    ...(!this.esDuenio && {
      generalDataTomador: {
        insured_document: this.insured_document || '',
        insured: this.insured || '',
        insured_address: this.insured_address || '',
        policy_holder_state: this.insured_state || '',
        policy_holder_city: this.insured_city || '',
        policy_holder_municipality: this.insured_municipality || '',
        isseur_store: 'COBRETAG C.A',
      }
    })
  };

  const verifyDocument = {
    plate: this.number_plate
  };

  this.cotizacionService.dataCotizador = cotizacion;
  this.cotizacionService.dataUser = mainForm;

  this._emissionService.generateToken().subscribe({
    next:(result) => {
      console.log(result);
      const token = result.access_token
    this._emissionService.verifyDocument(verifyDocument,token).subscribe({
    next: (result) => {
      console.log(result);
     if(result.message === 'Ya existe una poliza registrada con esta placa.'){
        this.mostrarToast(result.message,'toast-error')
      }
      else{
     this.cotizacionService.dataCotizador = cotizacion;
      this.cotizacionService.dataUser = mainForm;
      this.mostrarToast('Cotización generada con éxito', 'toast-success');
      this.router.navigate(['admin/result/cotizacion/vertice/data']);
      }
      
 
    },
    error: (e: HttpErrorResponse) => {
      console.log(e.error?.message);
      const msg = e.error?.message || 'Error desconocido';
      this.mostrarToast(msg, 'toast-error');
    }
  });
    }
  })
}

  private calcularClaseGrupo(): string {
    const tipo = this.tipoVehiculo;
    const subtipo = this.subtipo || '';
    const subtipoCarga = this.subtipoCarga || '';
    const uso = this.uso || '';
    let claseGrupo = "";

    if (tipo === "particular") {
      if (uso === "particular_1") claseGrupo = "particular_1";
      else if (uso === "particular_2") claseGrupo = "particular_2";
      else if (uso === "particular_3") claseGrupo = "particular_3";
      else if (uso === "particular_4") claseGrupo = "particular_4";
      else if (uso === "particular_5") claseGrupo = "particular_5";
      else if (uso === "particular_6" ) claseGrupo = "particular_6";
    } else if (tipo === "carga") {
      claseGrupo = subtipoCarga ? `carga_${subtipoCarga}` : "carga_7";
    } else if (tipo === "autobus") {
      claseGrupo = subtipo === "suburbano" ? "autobus_13"
                 : subtipo === "interurbano" ? "autobus_14"
                 : "autobus_12";
    } else if (tipo === "minibus") {
      claseGrupo = subtipo === "suburbano" ? "minibus_16"
                 : subtipo === "interurbano" ? "minibus_17"
                 : "minibus_15";
    } else if (tipo === "rustico") {
      claseGrupo = "rustico_19";
    } else if (tipo === "moto") {
      claseGrupo = "moto_20";
    } else if (tipo === "motocarro") {
      claseGrupo = "motocarro_21";
    } else if (tipo === "sangre") {
      claseGrupo = "sangre_22";
    } else if (tipo === "maquina") {
      claseGrupo = "maquina_23";
    }

    return claseGrupo;
}

  private getTarifas() {
  return {
    particular_1: { primaAnualEUR: 33, extranjera: { primaAnualEUR: 120 }, servicioGruaUSD: 80 },
    particular_2: { primaAnualEUR: 39, extranjera: { primaAnualEUR: 142 }, servicioGruaUSD: 80 },
    particular_3: { primaAnualEUR: 39, extranjera: { primaAnualEUR: 142 }, servicioGruaUSD: 120 },
    particular_4: { primaAnualEUR: 45, extranjera: { primaAnualEUR: 164 }, servicioGruaUSD: 80 },
    particular_5: { primaAnualEUR: 102, extranjera: { primaAnualEUR: 371 }, servicioGruaUSD: 80 },
    particular_6: { primaAnualEUR: 114, extranjera: { primaAnualEUR: 415 }, servicioGruaUSD: 80 },
    carga_7: { primaAnualEUR: 45, extranjera: { primaAnualEUR: 164 }, servicioGruaUSD: 120 },
    carga_8: { primaAnualEUR: 84, extranjera: { primaAnualEUR: 306 }, servicioGruaUSD: 140 },
    carga_9: { primaAnualEUR: 84, extranjera: { primaAnualEUR: 306 }, servicioGruaUSD: 0 },
    carga_10: { primaAnualEUR: 108, extranjera: { primaAnualEUR: 393 }, servicioGruaUSD: 0 },
    carga_11: { primaAnualEUR: 108, extranjera: { primaAnualEUR: 393 }, servicioGruaUSD: 0 },
    autobus_12: { primaAnualEUR: 114, extranjera: { primaAnualEUR: 415 }, servicioGruaUSD: 0 },
    autobus_13: { primaAnualEUR: 114, extranjera: { primaAnualEUR: 415 }, servicioGruaUSD: 0 },
    autobus_14: { primaAnualEUR: 258, extranjera: { primaAnualEUR: 939 }, servicioGruaUSD: 0 },
    minibus_15: { primaAnualEUR: 75, extranjera: { primaAnualEUR: 273 }, servicioGruaUSD: 0 },
    minibus_16: { primaAnualEUR: 75, extranjera: { primaAnualEUR: 273 }, servicioGruaUSD: 0 },
    minibus_17: { primaAnualEUR: 168, extranjera: { primaAnualEUR: 611 }, servicioGruaUSD: 0 },
    rustico_19: { primaAnualEUR: 75, extranjera: { primaAnualEUR: 273 }, servicioGruaUSD: 100 },
    moto_20: { primaAnualEUR: 15, extranjera: { primaAnualEUR: 55 }, servicioGruaUSD: 80 },
    motocarro_21: { primaAnualEUR: 21, extranjera: { primaAnualEUR: 76 }, servicioGruaUSD: 80 },
    sangre_22: { primaAnualEUR: 12, extranjera: { primaAnualEUR: 44 }, servicioGruaUSD: 0 },
    maquina_23: { primaAnualEUR: 30, extranjera: { primaAnualEUR: 109 }, servicioGruaUSD: 0 }
  };
}

private getCoberturas() {
  const isExtranjera = this.placa === 'extranjera';
  
  return {
    particular_1: { 
      danosCosasEUR: isExtranjera ? 10000 : 2000, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    },
    particular_2: { 
      danosCosasEUR: isExtranjera ? 10000 : 2000, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    },
    particular_3: { 
      danosCosasEUR: isExtranjera ? 10000 : 2000, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    },
    particular_4: { 
      danosCosasEUR: isExtranjera ? 11261 : 2252, 
      danosPersonasEUR: isExtranjera ? 16577 : 3315 
    },
    particular_5: { 
      danosCosasEUR: isExtranjera ? 11261 : 2252, 
      danosPersonasEUR: isExtranjera ? 16577 : 3315 
    },
    particular_6: { 
      danosCosasEUR: isExtranjera ? 11261 : 2252, 
      danosPersonasEUR: isExtranjera ? 16577 : 3315 
    },
    carga_7: { 
      danosCosasEUR: isExtranjera ? 9384 : 1877, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    },
    carga_8: { 
      danosCosasEUR: isExtranjera ? 10961 : 2192, 
      danosPersonasEUR: isExtranjera ? 16577 : 3315 
    },
    carga_9: { 
      danosCosasEUR: isExtranjera ? 11562 : 2312, 
      danosPersonasEUR: isExtranjera ? 17207 : 3441 
    },
    carga_10: { 
      danosCosasEUR: isExtranjera ? 12973 : 2595, 
      danosPersonasEUR: isExtranjera ? 21892 : 4378 
    },
    carga_11: { 
      danosCosasEUR: isExtranjera ? 12973 : 2595, 
      danosPersonasEUR: isExtranjera ? 21892 : 4378 
    },
    autobus_12: { 
      danosCosasEUR: isExtranjera ? 7508 : 1502, 
      danosPersonasEUR: isExtranjera ? 14084 : 2817 
    },
    autobus_13: { 
      danosCosasEUR: isExtranjera ? 7508 : 1502, 
      danosPersonasEUR: isExtranjera ? 14084 : 2817 
    },
    autobus_14: { 
      danosCosasEUR: isExtranjera ? 10000 : 2000, 
      danosPersonasEUR: isExtranjera ? 18769 : 3754 
    },
    minibus_15: { 
      danosCosasEUR: isExtranjera ? 7508 : 1502, 
      danosPersonasEUR: isExtranjera ? 14084 : 2817 
    },
    minibus_16: { 
      danosCosasEUR: isExtranjera ? 7508 : 1502, 
      danosPersonasEUR: isExtranjera ? 14084 : 2817 
    },
    minibus_17: { 
      danosCosasEUR: isExtranjera ? 12523 : 2505, 
      danosPersonasEUR: isExtranjera ? 18769 : 3754 
    },
    rustico_19: { 
      danosCosasEUR: isExtranjera ? 9369 : 1874, 
      danosPersonasEUR: isExtranjera ? 14084 : 2817 
    },
    moto_20: { 
      danosCosasEUR: isExtranjera ? 10000 : 2000, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    },
    motocarro_21: { 
      danosCosasEUR: isExtranjera ? 9369 : 1874, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    },
    sangre_22: { 
      danosCosasEUR: isExtranjera ? 1051 : 210, 
      danosPersonasEUR: isExtranjera ? 1877 : 375 
    },
    maquina_23: { 
      danosCosasEUR: isExtranjera ? 10000 : 2000, 
      danosPersonasEUR: isExtranjera ? 12523 : 2505 
    }
  };
}
}