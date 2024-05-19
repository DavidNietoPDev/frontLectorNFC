import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class NfcService {
  cookies = inject(CookieService)
  baseUrl = 'http://localhost:3000/api/nfc';
  httpClient = inject(HttpClient);


//Con esta solicitud HTTP POST, el objetivo es enviar los datos del formulario de inicio de sesión (formValue) al servidor,
// El método login devuelve una Promesa que permite manejar la respuesta de manera asíncrona en el código que llama a este método. 
  saveBBDD(formValue: any) {  
    const token = this.cookies.get('token_login')
    const headers = new HttpHeaders({
      'Authorization': token,
    });                         
    return firstValueFrom(                            
      this.httpClient.post<any>(this.baseUrl + '/save', formValue, { headers })
    );
  }
}
