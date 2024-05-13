import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { ParseoComponent } from './parseo/parseo.component';
import { loginGuard } from './guards/login.guard';
import { UserRegisterComponent } from './user-register/user-register.component';


const routes: Routes = [

  {path: 'login', component: InicioSesionComponent},
  {path: 'userRegister', component: UserRegisterComponent},
  {
    path: 'parseo', 
    component: ParseoComponent,
    canActivate: [loginGuard]   //Indicamos que para acceder a la url de parseo hace falta el loginGuard
  },
  {path: '**', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
