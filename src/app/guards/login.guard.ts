import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";

export const loginGuard = () => {
    // router para navegar hacia otros urls
    const router = inject(Router);
    const cookies = inject(CookieService)

        //comprobamos si el token está en las cookies para dar acceso y sino vuelve al login
    if(cookies.get('token_login')){
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
}