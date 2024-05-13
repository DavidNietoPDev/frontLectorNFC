import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseUrl = 'https://test.bracelit.es/api/v1/login';
  httpClient = inject(HttpClient);


//Con esta solicitud HTTP POST, el objetivo es enviar los datos del formulario de inicio de sesión (formValue) al servidor,
// El método login devuelve una Promesa que permite manejar la respuesta de manera asíncrona en el código que llama a este método. 
  login(formValue: any) {                             
    return firstValueFrom(                            
      this.httpClient.post<any>(this.baseUrl, formValue)
    );
  }
}
                                                                     

