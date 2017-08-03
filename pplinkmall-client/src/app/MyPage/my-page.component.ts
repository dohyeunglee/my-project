import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProductService } from '../Service/products-serivce';
import { LoginService } from '../Service/login.service';

@Component({
  selector: 'buy',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.css'],
})

export class MyPageComponent implements OnInit{
  constructor(private loginService: LoginService, private router: Router){}

  ngOnInit(){
    this.loginService.session();
  }



}
