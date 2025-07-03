import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);

  private readonly baseUrl = environment.vertice_url.baseUrl;
  private readonly auth = environment.vertice_url.sypago.auth;
  private readonly otp = environment.vertice_url.sypago.otp;
  private readonly bank = environment.vertice_url.sypago.bank
  private readonly codeOtp = environment.vertice_url.sypago.codeOtp
  private readonly notification = environment.vertice_url.sypago.notification
  private readonly tasaBank = environment.vertice_url.sypago.tasaBank

  public authToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(`${this.baseUrl}/${this.auth}`, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let Msg = 'authentication failed ';
          if (err.status === 404 && err.error) {
            return throwError(() => new Error(Msg));
          }
          return throwError(() => err);
        })
      );
  }

  public realizarPago(data: any,token:any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        'SyPago-Token': token
    });

    return this.http
      .post<any>(`${this.baseUrl}/${this.otp}`, data, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let Msg = 'payment not found ';
          if (err.error) {
            return throwError(() => new Error(Msg));
          }
          return throwError(() => err);
        })
      );
  }

  public verifyCodeOTP(data: any,token:any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
          'SyPago-Token': token
    });

    return this.http.post<any>(`${this.baseUrl}/${this.codeOtp}`, data, {
      headers,
    });
  }

  public bankOptions(): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/${this.bank}`, { headers }).pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'no se encontró ningún banco ';
          if (err.error) {
            return throwError(() => new Error(msg));
          }
          return throwError(() => err);
        })
      )
    );
  }


  public getNotification(data: any,token:any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json','SyPago-Token': token });
    return this.http
      .post(`${this.baseUrl}/${this.notification}`, data, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'No se pudo obtener la notificación';
          if (err.error) {
            return throwError(() => new Error(msg));
          }
          return throwError(() => err);
        })
      );
  }

  public getTasaBank() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/${this.tasaBank}`, { headers }).pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'no se encontró ningúna tasa ';
          if (err.error) {
            return throwError(() => new Error(msg));
          }
          return throwError(() => err);
        })
      )
    );
  }
}
