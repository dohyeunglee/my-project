import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { LoginService } from './login.service';

@Injectable()
export class AuthGuard implements CanActivate{
  constructor(private loginService: LoginService, private router: Router, private http: Http){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>{
    let url: string = state.url;
    console.log('session? : ', this.loginService.loggedIn);
    console.log('call for canActivate: ', url);

    return this.checkLogin(url);
  }

  checkLogin(url: string): Observable<boolean>{
    return this.http.get('http://localhost:3000/process/session', {withCredentials: true})
     .map(response => {
       let parsed = response.json();
       if(parsed.type === 'SESSION_EXIST') {
         console.log('session exist in checkLogin')
         return true;
       }
       else {
         this.loginService.redirectUrl = url;
         this.router.navigate(['/login']);
         return false;
       }
     })
  }

}
