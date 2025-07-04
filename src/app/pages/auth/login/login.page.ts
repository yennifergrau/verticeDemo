import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  public title: string = "Iniciar sesión";
  public subtitle: string = "Olvidaste tu contraseña?";
  public information: string = "Iniciar sesión con";
  public formLogin!: FormGroup;
  public showLoading: boolean = false;
  public passwordFieldType: string = 'password';
  public passwordIcon: string = 'eye-off'; 


  constructor(
    private changedRefDef: ChangeDetectorRef,
    private toastController: ToastController,
    private navCtrl: NavController,
    private fb: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) { 
    this.Formulary();
  }

  private Formulary() : void{
    this.formLogin = this.fb.group({
      email: ['',[Validators.required,Validators.email]],
      password: ['',Validators.required],
      provider_id:['']
    })
  }

  get emailControl(): AbstractControl<any, any> {
    return this.formLogin.get('email')!;
  }

  get passwordControl(): AbstractControl<any, any> {
    return this.formLogin.get('password')!;
  }

  public togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordFieldType === 'password' ? 'eye-off' : 'eye';
  }

  private async toastMessage(message: string, icon: string, duration: number,color:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
      icon: icon,
      color:color,
      buttons: [
        {
          text: 'Ok',
        }
      ]
    });
    await toast.present();
  }

  public navigateRouting () {
    return this.navCtrl.navigateRoot('72a639d5a9b4b4efb2c2b87a05fc84e5');
  }

  public RoutingNavigate ()  {
    return this.navCtrl.navigateRoot('d9c67a47c4db8292cf4d24e2a9b8c9f2')
  }

  public async submit() {
  this.showLoading = true
  if (this.formLogin.valid) {
    (await this.authService.authentication(this.formLogin.value)).pipe(
      catchError((err : HttpErrorResponse) => {
        this.showLoading = false;
        if(err.status === 404) {
          this.toastMessage('Usuario no encontrado','alert-circle',2800,'danger')
        } else {
          this.toastMessage('Ocurrio un problema verifica la conexión','alert-circle',2800,'danger');
        }
        return throwError(err);
      })
    ).subscribe((response:any) => {
      this.showLoading = false;
      if(response.code === 200) {
        this.toastMessage('Authenticación exitosa','checkmark-circle',2800,'success');
        localStorage.setItem('auth-session',JSON.stringify(response));
        this.navCtrl.navigateRoot('e1f8a6b1e5c9b54a6d4f7c8d3a5a3e58').then(()=> {
          window.location.reload();
        });
      }
    })
  } else {
    this.formLogin.markAllAsTouched();
    this.toastMessage('Completa todos los campos','alert-circle',2800,'danger')
    this.showLoading = false;
  }
  } 

  public loginWithGoogle() {
    this.showLoading = true;
    if(window.onoffline){
      this.showLoading = false;
      this.toastMessage('En este momento no tienes conexión a la red, intenta nuevamente','alert-circle',2800,'danger')
    }else{
     this.authService.googleAuthentication()
    }
  }
}
