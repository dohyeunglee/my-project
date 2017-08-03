import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../Service/login.service';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import {NgModel} from "@angular/forms";
@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [{provide: CarouselConfig, useValue: {interval: 1500, noPause: true}}]
})

export class LoginComponent implements OnInit{
    init = true;
    login_fail = true;
    private id: string;
    private pwd: string;
    private registerId: string;
    private registerPwd: string;
    private register_status: string;
    duplicateId: boolean;
    pwdCheck: boolean;
    constructor(public loginService: LoginService, private router: Router){}

    ngOnInit(): void{
      this.loginService.session();
    }

    login(id: string, pwd: string): void{
      this.loginService.login(id, pwd).subscribe(() => {
        if(this.loginService.loggedIn) {
          let redirect = this.loginService.redirectUrl ? this.loginService.redirectUrl : '/products';
          console.log('redirectUrl in LoginComponent: ', redirect);
          this.router.navigate([redirect]);
          this.login_fail = false;
          this.init = false;
        }
        else {
          this.login_fail = true;
          this.init = false;
        }
      })
    }
  register(id: string, pwd: string): void{
    if(this.duplicateId === false) {
      this.loginService.register(id, pwd).subscribe(str => {
        console.log(str);
        if (str.type == 'SUCCESS') {
          this.register_status = 'SUCCESS';
        }
        else {
          console.log('why register error?: ', str.detail);
          this.register_status = str.detail;
        }
      })
    }
    else{
      alert('아이디 중복 체크를 해주세요');
    }
  }

  idCheck(e: any){
      console.log('f: ', e);
      if(this.registerId || this.registerId !== '') {
        this.loginService.idCheck(this.registerId).subscribe(str => {
          if (str.type === 'SUCCESS') {
            console.log('중복 없음');
            this.duplicateId = false;
          }
          else {
            console.log('중복 있음');
            this.duplicateId = true;
          }
        })
      }
  }

  passwordCheck(password: string){
    if(password === undefined || password === '') this.pwdCheck = undefined;
    else this.pwdCheck = password === this.registerPwd;
  }



}
