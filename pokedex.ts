import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {URL_SEREBII, MoveCategory, TYPE_IMG_SRC_REGEX} from './const.ts';

export interface PokedexEntry {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats: Stats;
  moves: Moveset[];
}

export interface Stats {
  hp: number;
  attack: number;
  defence: number;
}

export interface Moveset {
  category: MoveCategory;
  name: string;
}

export async function * getPokedex(): AsyncGenerator<PokedexEntry> {
  const url = new URL('pokemon.shtml', URL_SEREBII);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const dex of doc.querySelectorAll('table td.pkmn')) {
    const path = dex.children[0].attributes.getNamedItem('href').value;

    yield * getPokedexPath(path);
  }
}

async function * getPokedexPath(path: string): AsyncGenerator<PokedexEntry> {
  const url = new URL(path, URL_SEREBII);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const row of doc.querySelectorAll('table:nth-child(5) > tbody > tr:not(:first-child)')) {
    const id = Number(row.children[0].textContent.trim().slice(1));
    const image = new URL(row.children[1].querySelector('img')?.getAttribute('src')!, URL_SEREBII).href;
    const name = row.children[2].querySelector('a')?.textContent.trim()!;
    const types = [...row.children[3].querySelectorAll('a')].map((a) => TYPE_IMG_SRC_REGEX.exec(a.children[0].getAttribute('src')!)![1]);

    const statDoc = row.children[4].querySelectorAll('table tr');
    const stats: Stats = {
      hp: Number(statDoc[0].children[1].textContent.trim()),
      attack: Number(statDoc[0].children[1].textContent.trim()),
      defence: Number(statDoc[0].children[1].textContent.trim())
    };

    const fastMoves = [...row.children[5].querySelectorAll('a')].map((a) => a.children[0].textContent);
    const chargeMoves = [...row.children[6].querySelectorAll('a')].map((a) => a.children[0].textContent);

    const mapMoves = (category: MoveCategory) => (name: string) => ({category, name});
    const moves = [
      ...fastMoves.map(mapMoves('fast')),
      ...chargeMoves.map((mapMoves('charge')))
    ];

    yield {
      id,
      image,
      name,
      types,
      stats,
      moves
    };
  }
}
