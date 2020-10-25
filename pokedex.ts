import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {API_URL} from './const.ts';

export interface PokedexEntry {
  id: number;
  sprite: string;
  name: string;
  variant: string | null;
  types: string[];
  attack: number;
  defence: number;
  hp: number;
  url: string;
}

export async function * getPokedex(): AsyncGenerator<PokedexEntry> {
  const url = new URL('/go/pokedex', API_URL);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser()
  const doc = dom.parseFromString(html, 'text/html')!;

  const entries = doc.querySelectorAll('#pokedex tbody tr');
  for (const entry of entries) {
    const id = Number(entry.children[0].querySelector('.infocard-cell-data')?.textContent!);
    const sprite = entry.children[0].querySelector('.infocard-cell-img .icon-pkmn')?.attributes.getNamedItem('data-src').value!;
    const name = entry.children[1].querySelector('.ent-name')?.textContent!;
    const variant = entry.children[1].querySelector('.text-muted')?.textContent ?? null;
    const path = entry.children[1].querySelector('.ent-name')?.attributes.getNamedItem('href').value!;
    const url = new URL(path, API_URL).href;

    let types = [];
    for (const typeNode of entry.children[2].querySelectorAll('.type-icon')) {
      types.push(typeNode.textContent);
    }

    const attack = Number(entry.children[3].textContent);
    const defence = Number(entry.children[3].textContent);
    const hp = Number(entry.children[3].textContent);

    yield {
      id,
      sprite,
      name,
      variant,
      types,
      attack,
      defence,
      hp,
      url
    };
  }
}
