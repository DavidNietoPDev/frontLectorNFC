import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { ParseoComponent } from './parseo/parseo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { UserRegisterComponent } from './user-register/user-register.component';



@NgModule({
  declarations: [
    AppComponent,
    InicioSesionComponent,
    ParseoComponent,
    UserRegisterComponent,

    
  ],
  imports: [
    MatIconModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    JwtModule
    .forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('token_login');
        }
      }
    }),
    FormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule
    
    

  ],
  providers: [JwtHelperService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
