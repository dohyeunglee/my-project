export class Product{
  constructor(public id: number, public name: string, public image: string, public price: number, public info: string){}
}

export let MockProduct = [
  {
    id: 1,
    name: '조끼',
    image: './assets/images/1.jpg',
    price: 19500,
    info: 'V넥 라인 니트 조끼'
  },
  {
    id: 2,
    name: '청바지',
    image: './assets/images/2.jpg',
    price: 22000,
    info: '와이드헤지 연청 9부 일자 커플청바지'
  },
  {
    id: 3,
    name: '티셔츠',
    image: './assets/images/3.jpg',
    price: 9600,
    info: '여자나염반팔면원피스 Free 사이즈'
  }
];
