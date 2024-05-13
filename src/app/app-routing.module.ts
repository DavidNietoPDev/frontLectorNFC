import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { ParseoComponent } from './parseo/parseo.component';
import { loginGuard } from './guards/login.guard';


const routes: Routes = [

  {path: 'login', component: InicioSesionComponent},
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
