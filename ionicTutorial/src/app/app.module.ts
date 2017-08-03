import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { MyApp } from './app.component';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { WebRTCPage } from '../pages/WebRTCPage/WebRTCPage';
import { LandingPage } from '../pages/LandingPage/LandingPage';
import { ProductsPage } from '../pages/ProductsPage/ProductsPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage/ShoppingCartPage';
import { WebRTCChatRoomPage } from '../pages/WebRTCChatRoomPage/WebRTCChatRoomPage';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { LoginService } from '../services/login.service';
import { WebRTCService } from '../services/webrtc.service';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '0e7eadfd'
  },
  'push': {
    'sender_id': '7015578402',
    'pluginConfig': {
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    ListPage,
    LoginPage,
    WebRTCPage,
    LandingPage,
    ProductsPage,
    ShoppingCartPage,
    WebRTCChatRoomPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    ItemDetailsPage,
    LoginPage,
    ListPage,
    WebRTCPage,
    LandingPage,
    ProductsPage,
    ShoppingCartPage,
    WebRTCChatRoomPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LoginService,
    WebRTCService,
    Diagnostic,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
