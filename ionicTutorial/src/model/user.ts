export class User{
  constructor(public id: number, public name: string, public pwd: string){}
}

export let MockUser: Array<User>= [
  {
    id: 1,
    name: 'dohyeunglee',
    pwd: 'ehgud0627E'
  },
  {
    id: 2,
    name: 'ioweim',
    pwd: 'lee0627E'
  },
  {
    id: 3,
    name: 'kyujin0527',
    pwd: 'rbwls0527E'
  }
];
