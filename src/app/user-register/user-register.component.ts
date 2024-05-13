import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})


export class UserRegisterComponent {

  formulario: FormGroup;
  snackBar = inject(MatSnackBar)
  cookies = inject(CookieService)
  usersService = inject(UsersService)
  router = inject(Router)
  errorMessage: string = '';
  showLoading: boolean = false;
  
  constructor() {
    this.formulario = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })
  }

  async onSubmit() { 
    try {
      if (this.formulario.valid) {
        this.showLoading = true;
        const response = await this.usersService.login(this.formulario.value);
        //Si todo es correcto se recibe el token, se guarda en las cookies y se redirige a parseo.
        if (!response.error) { 
          this.cookies.set('token_login', response.token);
          this.router.navigate(['/parseo'])
          this.snackBar.open('Se ha registrado correctamente.', 'Cerrar', {duration: 5000});
        } 
      } else {
        this.errorMessage = 'Introduzca un email y contraseña.'
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
  hasErrors( controlName: string, errorType: string) {
    return this.formulario.get(controlName)?.hasError(errorType) && this.formulario.get(controlName)?.touched;
  }

  snackBarAdded( msj: string ) {
    this.snackBar.open(msj, 'Cerrar', {duration: 5000});
  }


}
