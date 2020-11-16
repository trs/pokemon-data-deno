import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {URL_SEREBII, PokemonMoveCategory, TYPE_IMG_SRC_REGEX} from './const.ts';

export interface PokemonMove {
  name: string;
  type: string;
  damage: number;
  duration: number;
  energy: number;
  damagePVP: number;
  energyPVP: number;
  durationPVP: number;
  category: PokemonMoveCategory;
}

export async function * getMoves(): AsyncGenerator<PokemonMove> {
  yield * getFastMoves();
  yield * getChargeMoves();
}

export async function * getFastMoves(): AsyncGenerator<PokemonMove> {
  const url = new URL('pokemongo/moves.shtml', URL_SEREBII);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const row of doc.querySelectorAll('#moves li[title="VCurrent"] table:nth-of-type(1) > tbody > tr:not(:nth-child(1))')) {
    const name = row.children[0].textContent.trim();
    const type = TYPE_IMG_SRC_REGEX.exec(row.children[1].children[0].children[0].getAttribute('src')!)?.[1]!;
    const damage = Number(row.children[2].textContent);
    const energy = Number(row.children[3].textContent);
    const duration = parseFloat(row.children[4].textContent.trim());
    const damagePVP = Number(row.children[5].textContent);
    const energyPVP = Number(row.children[6].textContent);
    const durationPVP = parseFloat(row.children[7].textContent.trim());

    yield {
      name,
      type,
      damage,
      duration,
      energy,
      damagePVP,
      energyPVP,
      durationPVP,
      category: 'fast'
    };
  }
}

export async function * getChargeMoves(): AsyncGenerator<PokemonMove> {
  const url = new URL('pokemongo/moves.shtml', URL_SEREBII);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const row of doc.querySelectorAll('#moves li[title="VCurrent"] table:nth-of-type(2) > tbody > tr:not(:nth-child(1))')) {
    const name = row.children[0].textContent.trim();
    const type = TYPE_IMG_SRC_REGEX.exec(row.children[1].children[0].children[0].getAttribute('src')!)?.[1]!;
    const damage = Number(row.children[2].textContent);
    const duration = parseFloat(row.children[4].textContent.trim());
    const energy = parseInt(row.children[5].children[0]?.getAttribute('alt') ?? '0');
    const damagePVP = Number(row.children[6].textContent);
    const energyPVP = Number(row.children[7].textContent);
    const durationPVP = duration;

    yield {
      name,
      type,
      damage,
      duration,
      energy,
      damagePVP,
      energyPVP,
      durationPVP,
      category: 'charge'
    };
  }
}
