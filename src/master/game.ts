import {URL_GAME_MASTER} from '../const.ts';

export type GameMaster = GameMasterTemplate[];

export interface GameMasterTemplate {
  templateId: string;
  data: any;
}

export async function getGameMaster(): Promise<GameMaster> {
  const url = new URL('master/versions/latest/V2_GAME_MASTER.json', URL_GAME_MASTER);
  const result = await fetch(url.href);
  const gm = await result.json() as {template: GameMaster};
  return gm.template;
}
