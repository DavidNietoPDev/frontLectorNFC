import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css'
})
export class InicioSesionComponent {

  formulario: FormGroup;
  snackBar = inject(MatSnackBar)
  cookies = inject(CookieService)
  usersService = inject(UsersService);
  router = inject(Router);
  errorMessage: string = '';
  showLoading: boolean = false;
  
  constructor() {
    // Inicializamos el formulario como FormGroup y usamos validaciones para cada campo
    this.formulario = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])

    });
   }
    //este método onSubmit envía los datos del formulario de inicio de sesión al servidor, maneja la respuesta del servidor, 
    //guarda el token recibido en las cookies si la autenticación es exitosa, 
    //y muestra mensajes de error apropiados si ocurren errores durante el proceso de inicio de sesión.
   async onSubmit() { 
    try {
      if (this.formulario.valid) {
        this.showLoading = true;
        const response = await this.usersService.login(this.formulario.value);
        //Si todo es correcto se recibe el token, se guarda en las cookies y se redirige a parseo.
        if (!response.error) { 
          this.cookies.set('token_login', response.token);
          this.router.navigate(['/parseo'])
          this.snackBar.open('Login realizado correctamente.', 'Cerrar', {duration: 5000});
        } 
      } else {
        this.errorMessage = 'Introduzca usuario  y contraseña válidos.'
        this.showLoading = false;
      }     
      // Capturamos cualquier error que se produzca en el login.
    }  catch (error: any) {    
      if (error.status === 401) {
        this.errorMessage = 'Credenciales incorrectas. Por favor, verifique su email y contraseña.';
        this.showLoading = false;
      } else if (error.status === 404) {
        this.errorMessage = 'Credenciales incorrectas. Por favor, verifique su email y contraseña.';
        this.showLoading = false;
      } else if (error.status === 500) {
        this.errorMessage = 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.';
        this.showLoading = false;
      } else {
        this.errorMessage = 'Error desconocido. Por favor, inténtelo de nuevo más tarde.';
        this.showLoading = false;
      }
    }
  }


  //este método se utiliza para determinar si un campo específico del formulario tiene algún tipo de error y si el usuario ha interactuado con ese campo del formulario
  hasErrors( controlName: string, errorType: string) {
    return this.formulario.get(controlName)?.hasError(errorType) && this.formulario.get(controlName)?.touched;
  }

  snackBarAdded( msj: string ) {
    this.snackBar.open(msj, 'Cerrar', {duration: 5000});
  }
}
