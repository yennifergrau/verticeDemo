import { Component, inject, LOCALE_ID, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerComponent } from 'src/app/shared/components/spinner.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HttpClientModule } from '@angular/common/http';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { GetsetService } from 'src/app/shared/services/getset.service';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-sypago',
  templateUrl: './sypago.page.html',
  styleUrls: ['./sypago.page.scss'],
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerComponent,
    NgxMaskDirective,
    HttpClientModule,
  ],
  providers:[
    PaymentService,
    provideNgxMask(),
    GetsetService,
    { provide: LOCALE_ID, useValue: 'es' }
  ]
})
export class SypagoPage implements OnInit {

  renderer = inject(Renderer2);
  payment = inject(PaymentService);
  nav = inject(Router);
  getService = inject(GetsetService);
  showSpinner: boolean = false;
  data: any;
  banks: any[] = [];
  planDetails: any;
  dollarRate: number = 1;
  isPagoMovil: boolean = true;
  private countBank = environment.account
  private codeBank = environment.number_accout;
  paymentForm = new FormGroup({
    identification: new FormControl('', Validators.required),
    bank_code: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    account_number: new FormControl('', Validators.required),
    document_prefix: new FormControl('V', Validators.required),
  });

  ultimaCotizacion: any = null;

  constructor(private cotizacionService: GetsetService) { }

  back(){
    this.nav.navigate(['/admin/result/cotizacion/vertice/data'])
  }

  formatCurrency(value: number): string {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  get idenifyControl(): AbstractControl<any> {
    return this.paymentForm.get('identification')!;
  }
  get bank_codeControl(): AbstractControl<any> {
    return this.paymentForm.get('bank_code')!;
  }
  get phoneControl(): AbstractControl<any> {
    return this.paymentForm.get('phone')!;
  }
  get account_numberControl(): AbstractControl<any> {
    return this.paymentForm.get('account_number')!;
  }
  get document_prefixControl(): AbstractControl<any> {
    return this.paymentForm.get('document_prefix')!;
  }

  SetIsPagoMovil(isPagoMovil: any) {
    this.isPagoMovil = isPagoMovil.value === 'true';
    if (this.isPagoMovil) {
      this.paymentForm.get('account_number')?.disable();
      this.paymentForm.get('phone')?.enable();
    } else {
      this.paymentForm.get('account_number')?.enable();
      this.paymentForm.get('phone')?.disable();
    }
  }


  ngOnInit() {

    this.ultimaCotizacion = this.cotizacionService.dataCotizador;
    this.showSpinner = true;
    forkJoin({
      banks: this.payment.bankOptions(),
      dollarRate: this.payment.getTasaBank(),
    }).subscribe({
      next: (results) => {
        this.banks = results.banks.filter(({ IsDebitOTP }: any) => IsDebitOTP);
        this.dollarRate = results.dollarRate.find(({ code }: any) => {
          return code === 'EUR';
        }).rate;
        this.showSpinner = false;
      },
      error: () => {
        this.mostrarToast(
          'No se pudo recuperar la información del servidor',
          'toast-error'
        );
      },
    });
  }

  onSubmit() {
    if (this.isPagoMovil) {
      this.paymentForm.get('account_number')?.disable();
    } else {
      this.paymentForm.get('phone')?.disable();
    }
    if (this.paymentForm.valid) {
      const countOption = this.isPagoMovil ? 'CELE' : 'CNTA';
      const paymentData = {
        creditor_account: {
          bank_code: this.codeBank,
          type: 'CNTA',
          number: this.countBank,
        },
        debitor_document_info: {
          type: this.paymentForm.get('document_prefix')?.value,
          number: this.paymentForm.get('identification')?.value?.toString(),
        },
        debitor_account: {
          bank_code: this.paymentForm.get('bank_code')?.value,
          type: countOption,
          number: this.isPagoMovil
            ? '0' + this.paymentForm.get('phone')?.value
            : this.paymentForm.get('account_number')?.value,
        },
        amount: {
          amt: Number((this.dollarRate * this.ultimaCotizacion.resultado.primaTotal.bs).toFixed(2)),
          currency: 'VES',
        },
      };
      this.showSpinner = true;
      this.payment.authToken().subscribe({
        next: (authToken) => {
          const token = authToken.access_token
          console.log(token);
          this.payment.realizarPago(paymentData,token).subscribe({
            next: async (response) => {
              await this.mostrarToast(
                'Código enviado con éxito',
                'toast-success'
              );
              this.getService.dataOtp = paymentData
              this.nav.navigate(['/admin/sypago/otp/vetice/data']);
              this.showSpinner = false;
            },
            error: (error) => {
              this.showSpinner = false;
              this.mostrarToast(
                'Hubo un error al realizar el pago. Intente nuevamente.',
                'toast-error'
              );
            },
          });
        },
        error: (error) => {
          this.showSpinner = false;
          this.mostrarToast(
            'Hubo un error al verificar. Intente nuevamente.',
            'toast-error'
          );
        },
      });
    } else {
      this.paymentForm.markAllAsTouched();
      this.mostrarToast('Debes llenar los campos', 'toast-error');
      return;
    }
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
    }, 5000);
  }

}
