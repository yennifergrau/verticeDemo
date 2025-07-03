import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetsetService {


  get dataCotizador(): any {
    return JSON.parse(localStorage.getItem('dataCotizador') || '');
  }

  get dataOtp(): any{
    return JSON.parse(localStorage.getItem('dataOtp') || '');
  }

  get dataRCV(): any{
    return JSON.parse(localStorage.getItem('dataRCV') || '');
  }

  get dataUser(): any{
    return JSON.parse(localStorage.getItem('dataUser') || '');
  }



  set dataCotizador(value: string) {
    localStorage.setItem('dataCotizador', JSON.stringify(value));
  }

  set dataOtp(value: any) {
    localStorage.setItem('dataOtp', JSON.stringify(value));
  }

  set dataRCV(value:any) {
    localStorage.setItem('dataRCV', JSON.stringify(value));
  }

  set dataUser(value:any) {
    localStorage.setItem('dataUser', JSON.stringify(value));
  }
}
