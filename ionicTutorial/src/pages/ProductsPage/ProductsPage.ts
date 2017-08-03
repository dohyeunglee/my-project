import { Component } from '@angular/core';
import { MockProduct } from '../../model/product';

@Component({
  selector: 'page-products',
  templateUrl: 'ProductsPage.html'
})

export class ProductsPage {
  productsList = [];
  constructor() {
    this.productsList = MockProduct;
  }
}
