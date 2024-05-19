import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NfcService } from '../services/nfc.service';



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
  nfcService = inject(NfcService)


  mostrarHash: boolean = false;
  clearButton: boolean = false;
  errorDuplicates: string [] = [];
  codigosLeidos: number = 0;
  codigosNfc: Map<string, string> = new Map();
  indexHash: Map<number, string> = new Map();
  token: string = '';
  decodedToken: any;
  iatDate = new Date();
  expDate = new Date();
  currentTime = new Date();
  inactivityTimer: any;
  inactivityDuration: number = 180000;
  eventName: string = '';
  encryptar: string = '';
  encryptado: string = '';
  logaut: boolean = false;
  modalLogout: boolean = false;
  modalSave: boolean = false;
  modalReset: boolean = false;
  modalAceptLogout: boolean = false;
  modalAceptSave: boolean = false;
  modalResetAcept: boolean = false;
  showLoading: boolean = false;
  mensajeModalLogOut: string = '¿Confirma que desea cerrar sesión?'
  mensajeModalSave: string = '¿Confirma que desea guardar los datos?';
  mensajeModalReset: string = 'Si acepta reseteará todos los datos leídos, ¿Desea continuar?'


  onModalLogoutChange(value: boolean) {
    console.log('logout change')
    this.modalLogout = value;
  }
  onModalAceptLogout(value: boolean) {
    console.log('acept logout')
    this.modalAceptLogout = value;
  }
  onModalSaveChange(value: boolean) {
    console.log('save change')
    this.modalSave = value;
  }
  onModalResetChange(value: boolean) {
    console.log('reset change')
    this.modalReset = value;
  }


  onModalAceptSave(value: boolean) {
    console.log('acept save')
    this.modalAceptSave = value;
    this.onSubmitSave();

  }
  onModalAceptReset(value: boolean) {
    console.log('acept reset')
    this.modalResetAcept = value;
    this.aceptReset();
  }

  checkToken(): boolean {
    this.token = this.cookies.get('token_login')
    if (this.token) {
      try {                                             //Si existe el token lo decodificamos
        this.decodedToken = this.jwtHelper.decodeToken(this.token);
        if (!this.decodedToken) {
          console.log('Error al decodificar el token.');
          return false;
        }
        this.iatDate = new Date(this.decodedToken.iat * 1000);
        this.expDate = new Date(this.decodedToken.exp * 1000);
        this.currentTime = new Date();
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
        this.clearTokenExp();
        return false;
      }
    } else {
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
    this.snackBarAdded('El token ha expirado')       //Método que saca un snackbar informando que el token ha expirado, lo elimina y envía al login
    this.cookies.delete('token_login');
    this.router.navigate(['/login']);
  }
  clearToken() {                                   //Método para eliminar el token y volver al login
    this.cookies.delete('token_login');
    this.router.navigate(['/login']);
  }
  clearButtonClick() {
    this.clearButton = true;
  }
  clear() {
    if (this.modalReset || this.modalSave || this.clearButton) {
      this.eventName = '';
      this.encryptar = '';  //reseteamos los campos
      this.encryptado = '';
      this.showLoading = false;
      this.clearButton = false;
    } else {
      this.encryptar = '';
      this.encryptado = '';
      this.showLoading = false;
    }
  }
  showModalLogOut() {
    this.modalLogout = true;
  }
  showModalSave() {
    this.modalSave = true;
  }
  showModalReset() {
    this.modalReset = true;
  }
  // Al hacer click en el botón de logout, si el token está en cookies, abre el modal.
  onClickLogOut() {
    if (this.cookies.get('token_login')) {
      this.showModalLogOut();
    }
  }
  onClickSave() {
    if (this.cookies.get('token_login')) {
      this.showModalSave();
    }
  }

  aceptReset() {
    this.clear()
    this.codigosNfc.clear();
    this.indexHash.clear();
    this.codigosLeidos = 0;
    this.modalReset = false;
    this.modalSave = false;
  }

  onClickReset() {
    this.showModalReset();
  }

  private resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimer); // Reinicia el temporizador
    this.inactivityTimer = setTimeout(() => {   // Acción a realizar si no hay movimiento del ratón durante el tiempo especificado
      this.showModalLogOut()
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

  snackBarAdded(msj: string) {                              // Método que saca un snack bar de duración 5s
    this.snackbar.open(msj, 'Cerrar', { duration: 5000 });
  }

  getParCodigosKeys(): number[] {         //Método para coger los últimos 10 elementos del map
    const claves: number[] = Array.from(this.indexHash.keys());
    // const lastTenKeys = claves.slice(-10);
    return claves;
  }

  mostrarLista(): void {                  //Método que muestra la lista de códigos
    this.mostrarHash = !this.mostrarHash;
  }

  onClickEncrypt() {
    this.showLoading = true;
    if (this.checkToken()) { // checkeamos la expiración del token
      if (this.encryptar != '') { // comprobamos que el campo no está vacío
        if (!this.codigosNfc.has(this.encryptar)) { // Verificar si el código ya existe en la lista
          try {
            this.encryptado = this.encrypt(this.encryptar); // Encriptar el código
            this.codigosNfc.set(this.encryptar, this.encryptado); // Agregar el código encriptado al mapa   
            this.codigosLeidos = this.codigosNfc.size;  // Actualizar el contador de códigos leídos
            this.indexHash.set(this.codigosLeidos, this.encryptado);  //Establecer un índice en los hash
            this.volverAFocus(); // Devolver el foco al campo de entrada
            this.clear();     // Limpiar el campo de entrada
            this.snackBarAdded('Hash añadido a la lista de códigos hashs.') // Mostrar mensaje de éxito
          } catch (error) {
            window.alert('Error al encriptar el código')
          }
        } else {
          window.alert('El código ya ha sido leído y está en la lista de códigos hashs.')
          this.clear();
        }
      } else {
        window.alert('El campo de entrada está vacío')
        this.clear();
      }
    }
  }

  async onSubmitSave() {
    this.showLoading = true;
    try {
      if (this.eventName !== '' && Array.from(this.codigosNfc.values()).length > 0) {
        this.showLoading = true;
        const hashValues = Array.from(this.codigosNfc.values());
        const request = {
          "eventName": this.eventName,
          "hashCodes": hashValues
        };
        if (this.checkToken()) {
          const response = await this.nfcService.saveBBDD(request);
          if (!response.error) {
            this.snackBarAdded(response.success);
            this.aceptReset();
            this.showLoading = false;
          } else {
            this.snackBarAdded(response.error)
            this.showLoading = false;
          }
        } else {
          this.snackBarAdded('Token Expirado, vuelva a iniciar sesión')
          this.showLoading = false;
        }
      } else {
        this.snackBarAdded('Formulario inválido')
        this.showLoading = false;
      }
      // Capturamos cualquier error que se produzca en el login.
    } catch (error: any) {
      if (error.status === 409) {
        if (error.error.duplicates && error.error.duplicates.length > 0) {
          for (let cod of error.error.duplicates) {
            this.errorDuplicates.push(cod)
          }
            console.log(this.errorDuplicates)
        } else {
          this.snackBarAdded(error.error.error)
          console.log(error.error.error)
        }
          
        this.showLoading = false;
      } else if (error.status === 400) {
        this.snackBarAdded(error.error.error);
        this.showLoading = false;
      } else if (error.status === 500) {
        this.snackBarAdded('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
        this.showLoading = false;
      } else {
        this.snackBarAdded('Error desconocido. Por favor, inténtelo de nuevo más tarde.');
        this.showLoading = false;
      }

    }
  }

  encrypt = (data: string): string => {                 //función para encriptar, recibe un string y retorna otro ya encriptado
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }
}



