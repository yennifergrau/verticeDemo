import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EmissionService {

  private  http = inject( HttpClient)
  private readonly baseUrl = environment.vertice_url.baseUrl
  private readonly authorizee = environment.vertice_url.emission.authorize
  private readonly token =environment.vertice_url.emission.token 
  private readonly verify = environment.vertice_url.emission.verify

  public generateToken(){
    const data = {
      username : 'admin',
      password : 'admin1234'
    };
      const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    })
   return this.http.post<any>(`${this.baseUrl}/${this.token}`,data,{headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error('Error al generar el token'));
      }))
    }


  public verifyDocument( data: any, token:any ) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/${this.verify}`, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }


  public authorizePoliza(data: any, token:string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/${this.authorizee}`, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }


}
