import { User } from './user';

export class Room{
  constructor(public id: number, public name: string, public users: Array<string>, public info: string, public image: string){}
}

export let MockRoom: Array<Room> = [
  {
    id: 1,
    name: '플링크',
    users: [],
    info: '플링크 톡방 입니다',
    image: './assets/images/background.jpg'
  },
  {
    id: 2,
    name: '소개원실',
    users: [],
    info: '소개원실 톡방 입니다',
    image: './assets/images/background2.jpg'
  },
  {
    id: 3,
    name: '컴퓨터 비전',
    users: [],
    info: '컴퓨터 비전 톡방입니다',
    image: './assets/images/background4.jpeg'
  },
  {
    id: 4,
    name: '3학년 15반',
    users: [],
    info: '15반 병톡',
    image: './assets/images/sohye1.jpg'
  },
  {
    id: 5,
    name: '컴공 병남톡',
    users: [],
    info: '컴퓨터 공학부 15학번 톡',
    image: './assets/images/sohye2.jpg'
  }
];
