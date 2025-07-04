import { HttpErrorResponse } from '@angular/common/http';
import { Component} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  public formRegister!: FormGroup;
  public title: string = "Regístrate";
  public passwordFieldType: string = 'password';
  public passwordIcon: string = 'eye-off'; 
  public showLoading: boolean = false;
  public verificarCorreoControl: FormControl = new FormControl('');
  public correoNoCoincide: boolean = false;
  public correoCoincide: boolean = false
  public isSecondCheckboxChecked = false;


  public verificarCoincidencia(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const correoVerificado = inputElement.value; 
    const correoTomador = this.formRegister.get('email')?.value;
    this.correoNoCoincide = correoTomador !== correoVerificado;
    this.correoCoincide = correoTomador === correoVerificado;
  }

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private authService: AuthService,
  ) {
    this.generateForm();
   }

  
  private generateForm() {
    this.formRegister = this.fb.group({
      nombre:   ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email:    ['', [Validators.required, Validators.email]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^(0414|0416|0424|0426|0412)-\d{7}$/)
      ]],     
      password: ['', [Validators.required, Validators.minLength(6)]],
      provider: [''],
      provider_id: [''],
    });
  }

  public togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordFieldType === 'password' ? 'eye-off' : 'eye';
  }

  get nameControl(): AbstractControl<any, any> {
    return this.formRegister.get('nombre')!;
  }

  get apellidoControl(): AbstractControl<any, any> {
    return this.formRegister.get('apellido')!;
  }

  get telefonoControl(): AbstractControl<any, any> {
    return this.formRegister.get('telefono')!;
  }

  get emailControl(): AbstractControl<any, any> {
    return this.formRegister.get('email')!;
  }

  get passwordControl(): AbstractControl<any, any> {
    return this.formRegister.get('password')!;
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

  public routingNavigate() {
    return this.navController.navigateRoot('b4d9ef72dc4a9b91e8a1d6b9d1a423a7')
  }

  public loginWithGoogle() {
    this.showLoading = true;
    if(window.onoffline){
      this.showLoading = false;
      this.toastMessage('En este momento no tienes conexión a la red','alert-circle',2800,'danger')
    }else{
     this.authService.googleAuthentication()
    }
  }

  public async Submit() {
    this.showLoading = true;
    if (this.formRegister.valid) {
      (await this.authService.registerAuthentication(this.formRegister.value)).pipe(
        catchError((err: HttpErrorResponse) => {
          this.showLoading = false;
          if (err.error && err.error.message === 'User Already Registered') {
            this.toastMessage('El usuario ya se encuentra registrado', 'alert-circle',2800,'danger');
          } else {
            this.toastMessage('El usuario ya se encuentra registrado', 'alert-circle',2800,'danger');
          }
          return throwError(err);
        })
      ).subscribe(response => {
        this.showLoading = false;
        if (response.code === 200) {
          this.toastMessage('Registro  exitoso','checkmark-circle',2800, 'success');
          setTimeout(() => {
            return this.navController.navigateRoot('b4d9ef72dc4a9b91e8a1d6b9d1a423a7');
          }, 2500);
        }
      });
    } else {
      if (this.passwordControl.errors?.['minlength']) {
        this.toastMessage('La contraseña debe tener al menos 6 caracteres','alert-circle',2800, 'danger');
      } else {
        this.formRegister.markAllAsTouched();
        this.toastMessage('completa todos los campos ','alert-circle',2800,'danger');
      }
      setTimeout(() => {
        this.showLoading = false;
      }, 2500);
    }
  }

}
