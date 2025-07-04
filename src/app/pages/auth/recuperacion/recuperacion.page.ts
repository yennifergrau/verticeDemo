import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-recuperacion',
  templateUrl: './recuperacion.page.html',
  styleUrls: ['./recuperacion.page.scss'],
})
export class RecuperacionPage implements OnInit {

  private emailUsuario !: string | null;
  public showLoading = false;
  public title:string='Confirmar contraseña';
  public formGenerate!:FormGroup;
  public passwordFieldType: string = 'password';
  public passwordIcon: string = 'eye-off';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navController: NavController,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController
  ) {
    this.generateForm();
   }

  private generateForm() : void {
    this.formGenerate = this.fb.group({
      password:['',Validators.required],
      email:['']
    })
  }
  public togglePasswordVisibility() {
    if (this.passwordFieldType === 'password') {
      this.passwordFieldType = 'text';
      this.passwordIcon = 'eye';
    } else {
      this.passwordFieldType = 'password';
      this.passwordIcon = 'eye-off';
    }
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

  public async Submit() {
    this.showLoading = true;
    if(this.formGenerate.valid){
      (await this.authService.forgotPasswordd(this.formGenerate.value)).pipe(
        catchError((err:HttpErrorResponse) => {
          this.showLoading = false;
          if(err.status === 500){
            this.toastMessage('No se pudo actualizar la contraseña','alert-circle',2800,'danger')
          } else {
            this.toastMessage('Ocurrio un error intentalo nuevamente','alert-circle',2800,'danger')
          }
          return throwError(err);
        })
      ).subscribe(response => {
        this.showLoading = false;
        this.toastMessage('La contraseña fue actualizada con exito','checkmark-circle',2800,'success');
        setTimeout(() => {
          return this.navController.navigateRoot('b4d9ef72dc4a9b91e8a1d6b9d1a423a7')
        }, 3000);
      })
    }else {
      this.toastMessage('completa todos los campos ','alert-circle',2800,'danger');   
      setTimeout(() => {
        this.showLoading = false;
      }, 2500);
    } 
  }

  ngOnInit() {
    this.emailUsuario = this.activateRoute.snapshot.paramMap.get('email');
    setTimeout(() => {
      this.formGenerate.get('email')?.setValue(this.emailUsuario)    
    }, 2000);
  }

}
