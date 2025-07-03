import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from 'src/app/shared/components/spinner.component';
import { environment } from 'src/environments/environment.prod';
import { GetsetService } from 'src/app/shared/services/getset.service';
import { HttpClientModule } from '@angular/common/http';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { EmissionService } from 'src/app/shared/services/emission.service';


@Component({
  selector: 'app-sypagotp',
  templateUrl: './sypagotp.page.html',
  styleUrls: ['./sypagotp.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    HttpClientModule
  ],
  providers:[GetsetService,PaymentService,EmissionService]
})
export class SypagotpPage implements OnInit {

  public showLoading : boolean = false
  public otp: string[] = [];
  public otpLength: number = 8;
  private countBank = environment.account;
  private codeBank = environment.number_accout;
  private idTransaction!: string;
  private _paymentService= inject(GetsetService)
  private serviceP = inject(PaymentService)
  private emissionServie = inject(EmissionService)
  paymentData: any;
  private route = inject( Router )
  token : any
 
  private ultimaCotizacion : any
  constructor(
    private renderer: Renderer2,
  ) {
    this.ultimaCotizacion = this._paymentService.dataCotizador
    this.serviceP.authToken().subscribe({
      next:(result) => {
        console.log(result);
        
        this.token = result.access_token
      }
    })
   }

    public setOtpLength(length: number, event?: Event) {
    if (event) {event.stopPropagation();}
    this.otpLength = length;
    this.otp = Array(length).fill('');
  }

    public moveFocus(event: any, nextInputId: string) {
    const currentInput = event.target as HTMLInputElement;
    const value = currentInput.value;
    if (value.length === 1) {
      const nextInput = document.querySelector(`#${nextInputId}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

    public handleBackspace(event: any, currentInputId: string) {
    const currentInput = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && currentInput.value.length === 0) {
      const currentIndex = parseInt(currentInputId.replace('otp', ''), 10) - 1;
      if (currentIndex > 0) {
        const prevInputId = 'otp' + currentIndex;
        const prevInput = document.querySelector(`#${prevInputId}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          this.otp[currentIndex - 1] = '';
        }
      }
    }
  }

  
  public clearOtp() {
    this.otp = Array(this.otpLength).fill('');
  }

   public isOtpComplete(): boolean {
    return this.otp.length === this.otpLength && this.otp.every(value => value !== '');
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

  ngOnInit() {
    this.paymentData = this._paymentService.dataOtp
  }


    public async onSubmit() {
      this.showLoading = true;
      const otpCode = this.otp.join('').trim();
      if(otpCode.length  !== this.otpLength){
        alert(`El código OTP debe tener exactamente ${this.otpLength} dígitos.`);
        this.showLoading = false;
        return;
      }

      const data = {
        "internal_id": '1234567890',
        "group_id": '9876543210',
        "account": {
          "bank_code": this.codeBank,
          "type": "CNTA",
          "number": this.countBank
        },
        "amount": {
          "amt": this.paymentData.amount.amt,
          "currency": "VES"
        },
        "concept": "Cobro de Poliza",
        "notification_urls": {
          "web_hook_endpoint": 'https://sypagoMundial.polizaqui.com/getNotifications'
        },
        "receiving_user": {
          "otp": otpCode,
          "document_info": {
            "type": this.paymentData.debitor_document_info.type,
            "number": this.paymentData.debitor_document_info.number
          },
          "account": {
            "bank_code": this.paymentData.debitor_account.bank_code,
            "type": this.paymentData.debitor_account.type,
            "number": this.paymentData.debitor_account.number
          }
      }
    }
    try {
      const response = await firstValueFrom(this.serviceP.verifyCodeOTP(data,this.token));
      this.idTransaction = response.transaction_id;
      this.route.navigate(['/admin/confirmed/data/rcv/download']);
      this.getNotificationPayment();
    } catch (error) {
      this.mostrarToast(' Hubo un error al procesar el OTP','toast-error');
      this.showLoading = false
    }
  }


private async getNotificationPayment(){
 
    const id = {id_transaction: this.idTransaction};
    const interval = setInterval(() => {
        this.serviceP.getNotification(id,this.token).subscribe({
          next:async (data) => {
            console.log(data);
                   
          
            try{
              switch(data.status){
                case 'ACCP':
                    this.mostrarToast(' Pago procesado con éxito','toast-success');
           
                
                  clearInterval(interval);
                  break;

                  case 'RJCT':
                    this.mostrarToast(' La operación fue rechazada','toast-error');
                    this.showLoading = false;
                    clearInterval(interval);
                    break;

                    case "PEND":
                      case "PROC":
                        this.showLoading = false;
                        clearInterval(interval)
                        break;
                  
                  default: 
                  this.mostrarToast(' Error de conexión','toast-error');
                  this.showLoading = false;
                  clearInterval(interval);
                  break; 
              }
            }catch(error){
              this.showLoading = false
              clearInterval(interval);
              console.log(error);
            }
          },
          error: (err) => {
            this.mostrarToast(' Error de conexión','toast-error');
            clearInterval(interval);
          },
        })
    }, 10000);
  }


  // private emissionDto () {
  //   const data = JSON.parse(localStorage.getItem('dataUser') || '')
  //   console.log(data);
    
  //      this.emissionServie.authorizePoliza(data,this.token.access_token).subscribe({
  //       next:(result) => {
  //         this._paymentService.dataRCV = result
  //       }
  //     })
  // }

}
