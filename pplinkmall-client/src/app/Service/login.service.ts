import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Injectable()
export class LoginService{
  public loggedIn: boolean;
  public logInUser: string;
  redirectUrl: string;
  serverUrl = 'http://localhost:3000';
  headers = new Headers({'Content-type' : 'application/json'});
  constructor(private http: Http){}

  login(id: string, pwd: string): Observable<any>{
    console.log({id, pwd});
    return this.http.post(this.serverUrl+'/process/login', {id, pwd}, {headers:this.headers, withCredentials:true})
      .map(res => this.parseData(res))
      .do(res => {
        this.loggedIn = res.type === 'SUCCESS';
        this.logInUser = this.loggedIn ? res.detail : null;
      })
      .catch((err: Response | any) =>
      {
        console.log(err);
        return Observable.throw("err occur");
      });
  }

  idCheck(id: string): Observable<any>{
    console.log('in idCheck');
    return this.http.post(this.serverUrl + '/process/id_check', {id}, this.headers)
      .map(res => this.parseData(res))
      .catch((err: Response | any) =>
      {
        console.log(err);
        return Observable.throw("err occur");
      })
  }
  register(id: string, pwd: string): Observable<any>{
    console.log('ready for register: ', id + ', ' + pwd);
    return this.http.post(this.serverUrl+'/process/register', {id, pwd}, this.headers)
      .map(res => this.parseData(res))
      .catch((err: Response | any) =>
      {
        console.log(err);
        return Observable.throw("err occur");
      });
  }

  session(): void{
    console.log('im in service session()');
    this.http.get(this.serverUrl + '/process/session', {withCredentials: true})
      .subscribe(response => {
        let parsedResponse = this.parseData(response)
        if(parsedResponse.type === 'SESSION_EXIST'){
          console.log('session exist');
          this.loggedIn = true;
          this.logInUser = parsedResponse.detail;
          console.log('in service session set loggedin');
        }
        else{
          console.log('no session');
          this.loggedIn = false;
          this.logInUser = null;
        }
      });
  }
  logout(): Observable<any> {
    return this.http.post(this.serverUrl + '/process/logout', {}, {headers: this.headers, withCredentials: true})
      .map(response => this.parseData(response))
      .catch((err: Response | any) =>
      {
        console.log(err);
        return Observable.throw("err occur");
      });
  }

  private parseData(res: Response){
    let body = res.json();
    console.log("the data: ", body);
    return body;
  }

}
