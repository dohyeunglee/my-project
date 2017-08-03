import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login.component';
import { ShoppingListComponent } from './ShoppingCart/shopping-list.component';
import { ProductListComponent } from './ProductList/product-list.component';
import { ProductDetailComponent } from './ProductDetail/product-detail.component';
import { MyPageComponent } from './MyPage/my-page.component';
import { NavComponent } from './Nav/nav.component';

import { ProductService } from './Service/products-serivce';
import { LoginService } from './Service/login.service';
import { AuthGuard } from './Service/auth-guard.service';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ShoppingListComponent,
    ProductListComponent,
    ProductDetailComponent,
    MyPageComponent,
    NavComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CarouselModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [ProductService, LoginService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
