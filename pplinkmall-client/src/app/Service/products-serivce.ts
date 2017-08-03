import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Product } from '../Model/product';
import { ColorSize, Option } from '../Model/order';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class ProductService{
    products: Product[];
    serverUrl = 'http://localhost:3000';
    headers = new Headers({'Content-Type' : 'application/json'});
    options= {headers: this.headers, withCredentials: true};
    constructor(private http: Http){}

    getProducts(): void{
        this.http
        .get(this.serverUrl + '/process/products', {withCredentials:true})
        .map(response => this.parseData(response))
        .subscribe(response => {
          console.log('receive: ', response);
          this.products = response;
        });
    }

    private parseData(res: Response){
        let body = res.json();
        console.log("the data: ", body);
        return body;
    }


    getProduct(id: number): Observable<Product>{
      console.log('in getProduct: ', id);
      return this.http
        .get(this.serverUrl + '/process/product', {withCredentials: true, params: {id}})
        .map(response => this.parseData(response))
        .catch((err: Response | any) =>
        {
          console.log(err);
          return Observable.throw("err occur");
        })
    }

    getCarted(): Observable<any>{
        return this.http.get(this.serverUrl+'/process/carts', {withCredentials: true})
          .map(response => {

            console.log('장바구니 객체 서버로부터 받은 것: ', this.parseData(response));
            return this.parseData(response);
          })
          .catch((err: Response | any) =>
          {
            console.log(err);
            return Observable.throw("err occur");
          });
    }

    insertCart(id: number, select: ColorSize[], option: Option[]): Observable<any>{
      console.log('insertCart called');
      console.log('id: ' + id);
      return this.http.post(this.serverUrl + '/process/insert_cart', { id, select, option }, {headers:this.headers, withCredentials:true})
        .map(response => this.parseData(response))
        .catch((err: Response | any) =>
        {
          console.log(err);
          return Observable.throw("err occur");
        });
    }

    insertBuy(id: number, select: ColorSize[], option: Option[]): Observable<any>{
      console.log('insertBuy called');
      console.log('id: ', id);
      return this.http.post(this.serverUrl + '/process/buy', {id, select, option}, {headers:this.headers, withCredentials:true})
        .map(response => this.parseData(response))
        .catch((err: Response | any) =>
        {
          console.log(err);
          return Observable.throw("err occur");
        })
    }
    deleteCart(carted: number[]): Observable<any>{
      console.log('in deleteCart');
      return this.http.post(this.serverUrl + '/process/delete_cart', { carted }, {headers:this.headers, withCredentials:true})
        .map(response => this.parseData(response))
        .catch((err: Response | any) =>
        {
          console.log(err);
          return Observable.throw("err occur");
        });
    }


    getSelect(id: number): Observable<any[]>{
      console.log('getSelect: ', id);
      return this.http.get(this.serverUrl + '/process/select', {withCredentials:true, params:{id}})
        .map(response => this.parseData(response))
        .catch((err: Response | any) =>
        {
          console.log(err);
          return Observable.throw("err occur");
        })
    }

    getOption(id: number): Observable<any>{
      console.log('getOption: ', id);
      return this.http.get(this.serverUrl + '/process/option', {withCredentials:true, params:{id}})
        .map(response => this.parseData(response))
        .catch((err: Response | any) =>
        {
          console.log(err);
          return Observable.throw("err occur");
        })
    }

    recentClick(id?: number): Observable<any>{
      console.log('Im in recentClick: ', this.products);
        let id_send, image_send, product;
        if(id) {
          product = this.products.find(product => product.id === id);
        }
        if(product){
          id_send = product.id;
          image_send = product.image;
        }
        console.log('보내기전 : ', product);
        return this.http.get(this.serverUrl + '/process/recent', {withCredentials:true, params: {id: id_send, image: image_send}})
          .map(response => this.parseData(response))
          .catch((err: Response | any) =>
          {
            console.log(err);
            return Observable.throw("err occur");
          })
    }

}
