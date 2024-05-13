import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { MatSnackBar} from '@angular/material/snack-bar';



@Component({
  selector: 'app-parseo',
  templateUrl: './parseo.component.html',
  styleUrl: './parseo.component.css'
})
export class ParseoComponent {

  cookies = inject(CookieService)
  jwtHelper = inject(JwtHelperService);
  router = inject(Router);
  snackbar = inject(MatSnackBar)
  mostrarHash: boolean = false;
  codigosLeidos: number = 0;
  codigosNfc: Map<string, string> = new Map();
  token: string = '';
  decodedToken: any;
  iatDate = new Date();
  expDate = new Date();
  currentTime = new Date();
  inactivityTimer: any;
  inactivityDuration: number = 180000;
  encryptar: string = '';
  encryptado: string = '';
  logaut: boolean = false;
  modal: boolean = false;
  acept: boolean = false;
  cancel: boolean = false;
  cantidadMaxima: number = 1; 
  showLoading: boolean = false;
   

  //contructor para obtener el token y decodificarlo, comprobar si la fecha de experación ha pasado y si es así cerrar sesión
  checkToken() : boolean {
    this.token = this.cookies.get('token_login')
    if (this.token) {       
      try {                                             //Si existe el token lo decodificamos
        this.decodedToken = this.jwtHelper.decodeToken(this.token);
        this.iatDate = new Date(this.decodedToken.iat * 1000);
        this.expDate = new Date(this.decodedToken.exp * 1000);
        if (this.expDate > this.currentTime) {                              // Si la fecha de expiración es mayor a la fecha actual el token es válido
          console.log('Token válido.');
              return true;
        } else {
              console.log('Token expirado.');                               // En caso contrario el token no es válido y hay que volver a loguerase. 
              this.clearTokenExp();                                         // (Se podría renovar, pero haría falta otro endpoint que reciba el viejo y lo renueve)
              return false;
        }
      } catch (error) {
          alert("Error: al decodificar el token");
          return false;
      }
    }  else {
      console.log('No hay token disponible');
      return false;
    } 
  }

  @ViewChild('inputcrypt') inputcrypt: ElementRef | undefined;  //@ViewChild se usa para obtener una referencia a un elemento del DOM en la plantilla de un componente

  ngAfterViewInit() {                                             //se ejecuta después de que se hayan inicializado las vistas del componente.
    if (this.inputcrypt && this.inputcrypt.nativeElement) {       // En este método, se comprueba si inputcrypt está definido y si su propiedad nativeElement 
      this.inputcrypt.nativeElement.focus();                      //(que contiene el elemento real del DOM) está disponible. Si es así, se establece el foco en este elemento.
    }
  }                                                          
                                                                    
    
  volverAFocus() {
    if (this.inputcrypt && this.inputcrypt.nativeElement) {       //para volver a establecer el foco en el elemento inputcrypt
      this.inputcrypt.nativeElement.focus();
      
    }
  }

  clearTokenExp() {
    this.snackbar.open('El token ha expirado', 'Cerrar', {duration: 5000});       //Método que saca un snackbar informando que el token ha expirado, lo elimina y envía al login
    this.cookies.delete('token_login');
    this.router.navigate(['/login']);
  }

  clearToken() {                                   //Método para eliminar el token y volver al login
    this.cookies.delete('token_login');
    this.router.navigate(['/login']);
  }

  closeModal() {
    this.modal = false;
    this.acept = false;
    this.cancel = false;
  }

  showModal() {
    this.modal = true;
  }

  // Eliminar el token solo si se acepta
  aceptModal() {
    this.clearToken();
    this.closeModal();
  }

  cancelModal() {
    this.cancel = true;
    this.closeModal()
  }

  // Al hacer click en el botón de logout, si el token está en cookies, abre el modal.
  onClickLogOut() {
    if (this.cookies.get('token_login')) {
      this.showModal();
    }
  }

  private resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimer); // Reinicia el temporizador
    this.inactivityTimer = setTimeout(() => {   // Acción a realizar si no hay movimiento del ratón durante el tiempo especificado
      this.showModal()
    }, this.inactivityDuration);  //Duración de la inactividad máxima permitida
  }

  // HostListener para escuchar eventos del ratón, teclado, ventana...
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keypress', ['$event'])

  onMouseMove(event: MouseEvent) {          // escucha los eventos de ratón y resetea el timer 
    this.resetInactivityTimer();
  }
  onKeyPress(event: KeyboardEvent) {        // escucha los eventos de teclado y resetea el timer de caducidad de sesión
    this.resetInactivityTimer();
  }

  snackBarAdded( msj: string ) {                              // Método que saca un snack bar de duración 5s
    this.snackbar.open(msj, 'Cerrar', {duration: 5000});
  }

  getParCodigosKeys(): string[] {         //Método para coger los últimos 10 elementos del map
    const claves: string[] = Array.from(this.codigosNfc.keys());  
    const lastTenKeys = claves.slice(-10);
    return lastTenKeys;
  }

  mostrarLista(): void {                  //Método que muestra la lista de códigos
    this.mostrarHash = !this.mostrarHash;
  }


  onClickEncrypt() {
    this.showLoading = true;
    if(this.checkToken()) { // checkeamos la expiración del token
      if (this.encryptar != '') { // comprobamos que el campo no está vacío
        if (!this.codigosNfc.has(this.encryptar)) { // Verificar si el código ya existe en la lista
          try {
            this.encryptado = this.encrypt(this.encryptar); // Encriptar el código
            this.codigosNfc.set(this.encryptar, this.encryptado); // Agregar el código encriptado al mapa     
            this.volverAFocus(); // Devolver el foco al campo de entrada
            this.codigosLeidos = this.codigosNfc.size;  // Actualizar el contador de códigos leídos  
            this.clear();     // Limpiar el campo de entrada
            this.snackBarAdded('Hash añadido a la base de datos') // Mostrar mensaje de éxito
          } catch (error) {
            window.alert('Error al encriptarl el código')
          }   
      } else {       
        window.alert('El código ya existe en la base de datos')
        this.clear();
      }
    } else {   
      window.alert('El campo de entrada está vacío')
      this.clear();
    }
  }
}

  clear() {
    this.encryptar = '';  //reseteamos los campos
    this.encryptado = '';
    this.showLoading  = false;
  }

  encrypt = (data: string): string => {                 //función para encriptar, recibe un string y retorna otro ya encriptado
    return CryptoJS.AES.encrypt(data, '').toString();
  }
}

  // onClickDescrypt() {
  //   if(this.checkToken()) { 
  //     if (this.encryptado != '') {
  //         this.encryptar = (this.decrypt(this.encryptado))
  //         console.log(this.encryptar);
  //         console.log('Acción realizada');
  //   }else {
  //     console.log('El campo de entrada está vacío')
  //     window.alert('El campo de entrada está vacío')
  //   }
  //   }
  // }

  
//   decrypt = (data: string): string => {
//     return CryptoJS.AES.decrypt(data, '').toString(CryptoJS.enc.Utf8);
//   }
 


