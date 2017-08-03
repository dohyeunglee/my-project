import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './Login/login.component';
import { ShoppingListComponent } from './ShoppingCart/shopping-list.component';

import { MyPageComponent } from './MyPage/my-page.component';
import { ProductListComponent } from './ProductList/product-list.component';
import { ProductDetailComponent } from './ProductDetail/product-detail.component';

import { AuthGuard } from './Service/auth-guard.service';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch:'full'},
    { path: 'login', component: LoginComponent },
    { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] },
    { path: 'product/:id', component: ProductDetailComponent, canActivate: [AuthGuard]},
    { path: 'shoppinglist', component: ShoppingListComponent, canActivate: [AuthGuard]},
    { path: 'mypage', component: MyPageComponent, canActivate: [AuthGuard]}
];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule{}
