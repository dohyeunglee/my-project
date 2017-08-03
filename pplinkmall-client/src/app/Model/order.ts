import { Product } from './product';
import { User } from './user';

export class Carted{
  constructor(public id: number, public product: number, public select: ColorSize[], public option: Option[], public checked: boolean){}
}
export class ColorSize{
  constructor(public product: number, public color: string, public size: string, public number: number, public storage: number){}
}

export class Option{
  constructor(public product: number, public option: string, public price: number, public number: number, public storage: number){}
}

