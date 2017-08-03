import { Component, OnInit } from '@angular/core';
import { Product } from '../Model/product';
import { LoginService } from '../Service/login.service';

import { ProductService }  from '../Service/products-serivce';
import { Router } from '@angular/router';

@Component({
    selector: 'product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})

export class ProductListComponent implements OnInit{

    constructor(public productService: ProductService, private loginService: LoginService, private router: Router){}

    ngOnInit(): void{
      this.loginService.session();
      this.productService.getProducts();
    }

    goProduct(id: number): void{
      this.productService.recentClick(id).subscribe(str => {
        if(str.type === 'SUCCESS'){
          console.log('최근 본 상품 등록 성공');
        }
        else{
          console.log('최근 본 상품 등록 실패');
        }
      });
      this.router.navigate(['product', id]);
    }
}
