import { Component, ViewChild, OnDestroy } from '@angular/core';

import { Platform, Nav, MenuController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/LoginPage/LoginPage';
import { LandingPage } from '../pages/LandingPage/LandingPage';
import { WebRTCPage } from '../pages/WebRTCPage/WebRTCPage';
import { ProductsPage } from '../pages/ProductsPage/ProductsPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage/ShoppingCartPage';

import { WebRTCService } from '../services/webrtc.service';

@Component({
  templateUrl: 'app.html',
})
export class MyApp implements OnDestroy{
  @ViewChild(Nav) nav: Nav;

  rootPage;
  pages: Array<{title: string, component: any, icon: string}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public menuCtrl: MenuController,
    public rtcService: WebRTCService
  ) {
    this.initializeApp();
  }

  ngOnDestroy() {
    console.log('App is destroyed');
    this.rtcService.localStream.getTracks().forEach(track => track.stop());
  }
  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      console.log('device ready');
      this.pages = [];
      this.pages.push({title: 'WebRTC', component: WebRTCPage, icon: 'chatbubbles'});
      this.pages.push({title: 'Products', component: ProductsPage, icon: 'beer'});
      this.pages.push({title: 'ShoppingCart', component: ShoppingCartPage, icon:'cart'});
      this.rootPage = LandingPage;
    });
  }

  openPage(page) {
    this.menuCtrl.close('main-menu');
    this.nav.push(page.component);
  }

}
