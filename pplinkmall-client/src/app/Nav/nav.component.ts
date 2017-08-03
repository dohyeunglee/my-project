import { Component } from '@angular/core';
import { LoginService }from '../Service/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'custom-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})

export class NavComponent{

  constructor(public loginService: LoginService, private router: Router){}

  logout(){
    this.loginService.logout().subscribe(str => {
      if (str.type === 'LOGOUT_SUCCESS') {
        console.log('logout success');
        this.loginService.session();
        this.router.navigate(['/']);
      }
      else {
        console.log('logout fail');
      }
    })
  }


}
