import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {API_URL} from './const.ts';

export interface PokemonForm {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface Pokemon {
  name: string;
  forms: PokemonForm[];
}

export async function getPokemon(path: string): Promise<Pokemon> {
  const url = new URL(path, API_URL);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser()
  const doc = dom.parseFromString(html, 'text/html')!;

  const name = doc.querySelector('#main > h1')?.textContent!;

  const formNames = doc.querySelector('.tabset-basics > .tabs-tab-list')?.children!;
  const formList = doc.querySelector('.tabset-basics > .tabs-panel-list')?.children!;

  const pokemon: Pokemon = {
    name,
    forms: []
  }

  for (let i = 0; i < formNames.length; i++) {
    const formName = formNames[i].textContent;

    const id = Number(formList[i].querySelector('.vitals-table tr:nth-child(1) > td')?.textContent!);
    const image = formList[i].querySelector('a[rel="lightbox"] > img')?.attributes.getNamedItem('src').value!;
    const typeElements = formList[i].querySelector('.vitals-table tr:nth-child(2) > td')?.children!;

    let types = [];
    for (const typeElement of typeElements) {
      types.push(typeElement.textContent);
    }

    pokemon.forms.push({
      id,
      name: formName,
      image,
      types
    });
  }

  return pokemon;
}
