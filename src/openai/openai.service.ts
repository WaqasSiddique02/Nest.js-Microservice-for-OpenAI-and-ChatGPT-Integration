import { Injectable } from '@nestjs/common';

type Message = {
  text: string;
  ai?: boolean;
};

@Injectable()
export class OpenaiService {
    constructor(){
        
    }
}
