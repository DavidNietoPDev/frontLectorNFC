import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit {

  cookies = inject(CookieService)
  router = inject(Router)
  snackbar = inject(MatSnackBar)

  @Output() modalChange = new EventEmitter<boolean>();
  @Output() modalAcept = new EventEmitter<boolean>();

  @Input() mensaje: string = '';
  modal: boolean = false;
  acept: boolean = false;
  cancel: boolean = false;


  ngOnInit(): void {
    this.modal = true;
    this.emitModalChange();
  }
  emitModalChange() {
    this.modalChange.emit(this.modal);
  }


  emitModalAceptChange() {
    this.modalAcept.emit(this.acept);
  }


  aceptModal() {
    if (this.mensaje === '¿Confirma que desea cerrar sesión?') {
      this.clearToken();
    } else {
      this.emitModalAceptChange()
    }   
  }

  cancelModal() {
    this.cancel = true;
    this.closeModal()
  }

  clearToken() {                                   //Método para eliminar el token y volver al login
    this.cookies.delete('token_login');
    this.router.navigate(['/login']);
    this.snackBarAdded('Se ha cerrado sesión correctamente')
  }

  closeModal() {
    this.modal = false;
    this.acept = false;
    this.cancel = false;
    this.emitModalChange();
  }

  snackBarAdded(msj: string) {                              // Método que saca un snack bar de duración 5s
    this.snackbar.open(msj, 'Cerrar', { duration: 5000 });
  }

}
