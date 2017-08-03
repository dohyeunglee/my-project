import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../LoginPage/LoginPage';

@Component({
  selector: 'page-landing',
  templateUrl: 'LandingPage.html'
})

export class LandingPage {
  constructor(public navCtrl: NavController){}

  navigateToLoginPage() {
    console.log('tabbed');
    this.navCtrl.push(LoginPage);
  }
}
