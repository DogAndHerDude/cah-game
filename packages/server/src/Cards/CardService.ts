import { Injectable } from '@nestjs/common';
import { CardService as GameCardService, IPack } from '@cah-game/game';

@Injectable()
export class CardService {
  private gameCardService: GameCardService = new GameCardService();

  public getDeck(packs?: Array<number>): Array<IPack> {
    return this.gameCardService.getDeck(packs);
  }
}
