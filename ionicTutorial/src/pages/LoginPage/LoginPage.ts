import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { LoginService } from '../../services/login.service';
import { WebRTCPage } from '../WebRTCPage/WebRTCPage';

@Component({
  selector: 'page-login',
  templateUrl: 'LoginPage.html',
  // providers: [LoginService]
})
export class LoginPage implements OnInit{
  init = true;
  login_fail = true;
  private id: string;
  private pwd: string;
  // private registerId: string;
  // private registerPwd: string;
  // private register_status: string;
  // duplicateId: boolean;
  // pwdCheck: boolean;
  constructor(public loginService: LoginService, public alertCtrl: AlertController, public navCtrl: NavController){}

  ngOnInit(): void{
    console.log('Login Try');
    // this.loginService.session();
  }

  // login(id: string, pwd: string): void{
  //   this.loginService.login(id, pwd).subscribe(() => {
  //     if(this.loginService.loggedIn) {
  //       this.login_fail = false;
  //       this.init = false;
  //     }
  //     else {
  //       this.login_fail = true;
  //       this.init = false;
  //     }
  //   })
  // }

  ionViewCanEnter(): boolean {
    if(this.loginService.loggedIn) {
      console.log('이미 로그인 되어 있으므로 못 들어옴');
      return false;
    } else {
      console.log('로그인이 되어 있지 않음')
      return true;
    }
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Login Error!',
      subTitle: 'Type your username and password correctly',
      buttons: ['OK']
    });
    alert.present();
  }

  login(id: string, pwd: string) {
    console.log('Login: ', id, pwd);
    if(!id || !pwd || id.trim() === '' || pwd.trim() === '') {
      this.showAlert();
      this.id = '';
      this.pwd = '';
    } else {
      this.navCtrl.push(WebRTCPage);
      this.loginService.loggedIn = true;
      this.loginService.logInUser = id;
    }
  }
  // register(id: string, pwd: string): void{
  //   if(this.duplicateId === false) {
  //     this.loginService.register(id, pwd).subscribe(str => {
  //       console.log(str);
  //       if (str.type == 'SUCCESS') {
  //         this.register_status = 'SUCCESS';
  //       }
  //       else {
  //         console.log('why register error?: ', str.detail);
  //         this.register_status = str.detail;
  //       }
  //     })
  //   }
  //   else{
  //     alert('아이디 중복 체크를 해주세요');
  //   }
  // }

  // idCheck(e: any){
  //   console.log('f: ', e);
  //   if(this.registerId || this.registerId !== '') {
  //     this.loginService.idCheck(this.registerId).subscribe(str => {
  //       if (str.type === 'SUCCESS') {
  //         console.log('중복 없음');
  //         this.duplicateId = false;
  //       }
  //       else {
  //         console.log('중복 있음');
  //         this.duplicateId = true;
  //       }
  //     })
  //   }
  // }
  //
  // passwordCheck(password: string){
  //   if(password === undefined || password === '') this.pwdCheck = undefined;
  //   else this.pwdCheck = password === this.registerPwd;
  // }



}
