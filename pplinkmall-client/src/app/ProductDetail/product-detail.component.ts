import 'rxjs/add/operator/switchMap';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Product } from '../Model/product';
import { ProductService } from '../Service/products-serivce';
import { LoginService } from '../Service/login.service';
import { Option, ColorSize } from '../Model/order';

@Component({
    selector: 'product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})

export class ProductDetailComponent implements OnInit {
  product: Product;
  recents: string[];
  select: any[];
  option: any[];
  color: string[];
  size: string[];
  originalColor: string[];
  originalSize: string[];
  optionSelected: string = null;
  colorSelected: string = null;
  sizeSelected: string = null;
  optionReady: Option[] = [];
  colSizeReady: ColorSize[] = [];
  total: number = 0;


  constructor(private productService: ProductService,
              private route: ActivatedRoute,
              private router: Router,
              private loginService: LoginService) {
  }

  ngOnInit(): void {
    this.loginService.session();
    this.getProduct();
    this.getRecents();
  }

  getRecents(){
    this.productService.recentClick().subscribe(res => {
      if(res.type === 'SUCCESS'){
        console.log('받은 recents: ', res.data);
        this.recents = res.data;
      }
      else{
        console.log('받기 실패');
      }
    })
  }

  goProduct(image: string){
    this.router.navigate(['product', Number(image)]);
  }

  getProduct() {
    this.route.params
      .switchMap((params: Params) => this.productService.getProduct(+params['id']))
      .subscribe(product => {
        console.log("product:", product);
        this.product = product[0];
        this.getSelect();
        this.getOption();
      })
  }


  getSelect() {
    this.productService.getSelect(this.product.id).subscribe(select => {
      console.log('successfully receive the selects');
      this.select = select;
      let tmpColor = [];
      let tmpSize = [];
      for (let i = 0; i < select.length; i++) {
        if (!tmpColor.includes(select[i].color)) {
          tmpColor.push(select[i].color);
        }
        if (!tmpSize.includes(select[i].size)) {
          tmpSize.push(select[i].size);
        }
      }
      this.color = tmpColor;
      this.originalColor = tmpColor;
      this.size = tmpSize;
      this.originalSize = tmpSize;
    })
  }

  getOption() {
    this.productService.getOption(this.product.id).subscribe(option => {
      console.log('successfully receive the options');
      console.log('options: ', option);
      if(option.length == 0 ) this.option = null;
      else this.option = option;
    })
  }

  getColorFromSize(size: string): string[]{
    let adjustedColor = [];
    for(let i = 0 ; i < this.select.length ; i++){
      if(this.select[i].size === size){
        if(!adjustedColor.includes(this.select[i].color)){
          adjustedColor.push(this.select[i].color);
        }
      }
    }
    return adjustedColor;
  }

  getSizeFromColor(color: string): string[]{
    let adjustedSize = [];
    for(let i = 0 ; i < this.select.length ; i++){
      if(this.select[i].color === color){
        if(!adjustedSize.includes(this.select[i].size)){
          adjustedSize.push(this.select[i].size);
        }
      }
    }
    return adjustedSize;
  }

  adjustColor(color: string){
    if(!this.sizeSelected){
      this.size = this.getSizeFromColor(color);
    }
    else if(this.colorSelected && this.sizeSelected){
      this.sizeSelected = null;
      this.size = this.getSizeFromColor(color);
    }
    this.colorSelected = color;
  }

  adjustSize(size: string){
    if(!this.colorSelected){
      this.color = this.getColorFromSize(size);
    }
    else if(this.colorSelected && this.sizeSelected){
      this.colorSelected = null;
    }
    this.sizeSelected = size;
  }

  showOriginal(kind: string){
    if(kind === 'color'){
      if(this.colorSelected && this.sizeSelected) {
        this.color = this.originalColor;
      }
    }
    else{
      if(this.colorSelected && this.sizeSelected) {
        this.size = this.originalSize;
      }
    }
  }

  putSelect(): void{
    if(this.sizeSelected && this.colorSelected){
      let number = this.select.find(val => {
        return val.size === this.sizeSelected && val.color === this.colorSelected;
      });
      if(number.number === 0){
        alert('품절되었습니다. 죄송합니다');
        return;
      }
      let newSelect = new ColorSize(this.product.id, this.colorSelected, this.sizeSelected, 1, number.number);
      if(!this.contain(this.colSizeReady, newSelect)){
        this.colSizeReady.push(newSelect);
        this.total += this.product.price;
      }
      else{
        alert('이미 추가되어 있습니다');
      }
    }
  }

  transOption(option: string): string{
    let index = option.indexOf("(");
    return option.substring(0, index);
  }

  contain(arr: any[], obj: object): boolean{
    console.log('in contain');
    for(let i = 0 ; i < arr.length ; i++){
      let idx1 = JSON.stringify(arr[i]).indexOf('number');
      let idx2 = JSON.stringify(obj).indexOf('number');
      let cmp1 = JSON.stringify(arr[i]).substring(0,idx1);
      let cmp2 = JSON.stringify(obj).substring(0, idx2);
      if(cmp1 === cmp2) return true;
    }
    return false;
  }
  putOption(): void{
    if(this.optionSelected){
      let find = this.option.find(val => {
        return val.options === this.transOption(this.optionSelected);
      });
      if(find.number === 0){
        alert('품절되었습니다. 죄송합니다');
        return;
      }
      let newOption = new Option(this.product.id, this.transOption(this.optionSelected), find.price, 1, find.number);
      console.log('fucking: ', typeof newOption.number);
      if(!this.contain(this.optionReady, newOption)) {
        this.optionReady.push(newOption);
        this.total += find.price;
      }
      else{
        alert('이미 추가되어 있습니다');
      }
    }
  }

  deleteOption(opt: Option){
    let index = this.optionReady.indexOf(opt);
    this.optionReady.splice(index, 1);
    this.total -= opt.price * opt.number;
  }

  deleteSelect(sel: ColorSize){
    let index = this.colSizeReady.indexOf(sel);
    this.colSizeReady.splice(index, 1);
    this.total -= this.product.price * sel.number;
  }

  changeNumberSelect(input: any, select: ColorSize, click?: string){
    if(!new RegExp('^[0-9]*$').test(input.value)){
      alert('숫자만 입력 가능 합니다');
      input.value = select.number;
    }
    else{
      if(click === 'plus') {
        input.value++;
        if(input.value <= select.storage) {
          this.total += this.product.price;
        }
      }
      if(click === 'minus') {
        input.value--;
        if(input.value > 0) {
          this.total -= this.product.price;
        }
      }
      if(input.value === ''){
        input.value = select.number;
      }
      else if(input.value > select.storage){
        alert(`남은 재고가 ${select.storage}개입니다`);
        input.value = select.number;
      }
      else if(input.value <= 0){
        alert('1개 이상 주문 가능합니다');
        input.value = select.number;
      }
      else{
        if(!click){
          this.total = this.total - this.product.price * select.number + this.product.price * input.value;
        }
        select.number = input.value;
      }
    }
  }

  changeNumberOption(input: any, option: Option, click?: string){
    if(!new RegExp('^[0-9]*$').test(input.value)){
      alert('숫자만 입력 가능 합니다');
      input.value = option.number;
    }
    else{
      if(click === 'plus') {
        input.value++;
        if(input.value <= option.storage){
          this.total += option.price;
        }
      }
      if(click === 'minus') {
        input.value--;
        if(input.value > 0){
          this.total -= option.price;
        }
      }
      if(input.value === ''){
        input.value = option.number;
      }
      else if(input.value > option.storage){
        alert(`남은 재고가 ${option.storage}개입니다`);
        input.value = option.number;
      }
      else if(input.value <= 0){
        alert('1개 이상 주문 가능합니다');
        input.value = option.number;
      }
      else{
        if(!click){
          this.total = this.total - option.price * option.number + option.price * input.value;
        }
        option.number = input.value;
      }
    }
  }

  insertCart(modal: any) {
    console.log('fucking: ', this.product.id, this.colSizeReady, this.optionReady);
    if (!this.colSizeReady[0]) {
      alert('색상과 사이즈를 선택해주세요');
    }
    else {
      this.productService.insertCart(this.product.id, this.colSizeReady, this.optionReady).subscribe(str => {
        if (str.type === 'SUCCESS') {
          console.log('장바구니 추가 성공');
          modal.show();
        }
        else {
          console.log('장바구니 추가 실패');
          alert('오류 발생');
        }
      })
    }
  }

  insertBuy(modal: any){
    console.log('fucking2: ', this.product.id, this.colSizeReady, this.optionReady);
    if(!this.colSizeReady[0]){
      alert('색상과 사이즈를 선택해주세요');
    }
    else{
      this.productService.insertBuy(this.product.id, this.colSizeReady, this.optionReady).subscribe(str => {
        if(str.type === 'SUCCESS'){
          console.log('구매 성공');
          modal.show();
        }
        else{
          console.log('구매 실패');
          alert('오류 발생');
        }
      })
    }
  }
}
