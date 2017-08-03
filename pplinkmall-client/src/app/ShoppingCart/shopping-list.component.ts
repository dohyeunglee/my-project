import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../Service/products-serivce';
import { LoginService } from '../Service/login.service';
import { Product } from "../Model/product";
import { Carted, ColorSize, Option } from "../Model/order";


@Component({
  selector: 'shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})

export class ShoppingListComponent implements OnInit{
  carted: Carted[];

  constructor(public productService: ProductService, private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.session();
    this.productService.getProducts();
    this.getCarted();
  }

  getCarted(): void {
    console.log('fucking: ', this.productService.products);
    this.productService.getCarted().subscribe(carted => {
      let data = carted.data;
      let tmp = [];
      let index = 0;
      while(1){
        if(data.option[index]){
          let opt = data.option[index];
          let product_id = opt.product_id;
          let option = new Option(product_id, opt.options, opt.price, opt.optionNumber, opt.number);
          if(!tmp[opt.cart_id]){
            tmp[opt.cart_id] = new Carted(opt.cart_id, product_id, [], [option], true);
            console.log('새로 만듬: ',tmp[opt.cart_id]);
          }
          else{
            tmp[opt.cart_id].option.push(option);
            console.log('원래 있는거에 추가: ', tmp[opt.cart_id]);
          }
        }
        if(data.select[index]){
          let sel = data.select[index];
          let product_id = sel.product_id;
          let selection = new ColorSize(product_id, sel.color, sel.size, sel.selectNumber, sel.number);
          if(!tmp[sel.cart_id]){
            tmp[sel.cart_id] = new Carted(sel.cart_id, product_id, [selection], [], true);
            console.log('새로 만듬: ',tmp[sel.cart_id]);
          }
          else{
            tmp[sel.cart_id].select.push(selection);
            console.log('원래 있는거에 추가: ', tmp[sel.cart_id]);
          }
        }
        if(!data.option[index] && !data.select[index])
          break;
        index++;
      }
      let i = 0;
      while(1){
        if(i === tmp.length){
          break;
        }
        if(!tmp[i]){
          tmp.splice(i, 1);
          continue;
        }
        i++;
      }
      console.log('final tmp: ', tmp);
      this.carted = tmp;
   });
  }

  getCartedTotal(carted: Carted): number{
    if(this.carted) {
      let total = 0;
      for (let i = 0; i < carted.option.length; i++) {
        total += (carted.option[i].price * carted.option[i].number);
      }
      let product = this.productService.products.find(product => product.id === carted.product);
      for (let i = 0; i < carted.select.length; i++) {
        total += (product.price * carted.select[i].number);
      }
      return total;
    }
  }

  getSelectNumber(select: ColorSize[]): number{
    if(this.carted) {
      let total = 0;
      for (let i = 0; i < select.length; i++) {
        total += select[i].number;
      }
      return total;
    }
  }

  getOptionNumber(option: Option[]): number{
    if(this.carted) {
      let total = 0;
      for (let i = 0; i < option.length; i++) {
        total += option[i].number;
      }
      return total;
    }
  }

  getTotal(carted: Carted[]): number{
    let total = 0;
    if(carted){
      for(let i = 0 ; i < carted.length ; i++){
        if(carted[i].checked){
          total += this.getCartedTotal(carted[i]);
        }
      }
    }
    return total;
  }

  insertBuy(index: number, modal: any) {
    this.productService.insertBuy(this.carted[index].product, this.carted[index].select, this.carted[index].option).subscribe(str => {
      if (str.type === 'SUCCESS') {
        console.log('구매 성공');
        modal.show();
      }
      else {
        console.log('구매 실패');
        alert('오류 발생');
      }
    })
  }

  insertSelectedBuy(modal: any){
    let error;
    if(this.carted){
      for(let i = 0 ; i < this.carted.length ; i++){
        if(this.carted[i].checked){
          this.productService.insertBuy(this.carted[i].product, this.carted[i].select, this.carted[i].option).subscribe(str => {
            if(str.type === 'SUCCESS'){
              console.log('구매 성공');
            }
            else{
              console.log('구매 실패');
              alert('오류 발생');
              error = true;
            }
          })
          if(error) alert('오류 발생');
          else modal.show()
        }
      }
    }
  }

  changeChecked(index: number): void{
    if(this.carted){
      this.carted[index].checked = !this.carted[index].checked;
    }
  }

  deleteCart(index: number): void{
    console.log('Im in deleteCart');
    if(this.carted){
      this.productService.deleteCart([this.carted[index].id]).subscribe(str => {
        if(str.type === 'SUCCESS'){
          console.log('삭제 성공');
       }
       else{
         console.log('삭제 실패');
       }
      })
      this.carted.splice(index,1);
    }
  }

  deleteSelectedCart(): void{
    if(this.carted){
      console.log('fucking: ', this.carted[1]);
      let deleted = [];
      for(let i = 0 ; i < this.carted.length ; i++){
        if(this.carted[i].checked){
          deleted.push(this.carted[i].id)
        }
      }

      if(deleted.length !== 0) {
        this.productService.deleteCart(deleted).subscribe(str => {
          if (str.type === 'SUCCESS') {
            console.log('선택 삭제 성공');
          }
          else {
            console.log('선택 삭제 실패');
          }
          let index = 0;
          while(1){
            if(this.carted[index] === undefined){
              break;
            }
            if(this.carted[index].checked){
              this.carted.splice(index,1);
              continue;
            }
            index++;
          }
        });
      }
    }
  }

  checkAll(){
    if(this.carted){
      for(let i = 0 ; i < this.carted.length ; i++){
        this.carted[i].checked = !this.carted[i].checked;
      }
    }
  }


}
