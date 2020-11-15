import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {URL_SEREBII, MoveCategory, TYPE_IMG_SRC_REGEX, ID_IMG_SRC_REGEX, FORM_REGEX} from './const.ts';

export interface Pokemon {
  id: string;
  number: number;
  forms: Form[];
  name: string;
  image: string;
  types: string[];
  stats: Stats;
  moves: Moveset[];
}

export interface Form {
  id: string;
  code: string;
  name: string;
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

export async function * getPokedex(): AsyncGenerator<Pokemon> {
  const url = new URL('pokemongo/pokemon.shtml', URL_SEREBII);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const dex of doc.querySelectorAll('table td.pkmn')) {
    const path = dex.children[0].attributes.getNamedItem('href').value;

    yield * getPokedexPath(path);
  }
}

async function * getPokedexPath(path: string): AsyncGenerator<Pokemon> {
  const url = new URL(`pokemongo/${path}`, URL_SEREBII);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const row of doc.querySelectorAll('table:nth-child(5) > tbody > tr:not(:first-child)')) {
    const image = new URL(row.children[1].querySelector('img')?.getAttribute('src')!, URL_SEREBII).href;
    const number = parseInt(ID_IMG_SRC_REGEX.exec(image)?.[1]!);

    const name = row.children[2].querySelector('a')?.textContent.trim()!;
    const formDescriptions = FORM_REGEX.exec(row.children[2].innerHTML.trim())?.[1].split('<br>') ?? [];
    const forms = [
      /^Mega /.test(name) ? 'Mega' : '',
      /^Primal /.test(name) ? 'Primal' : '',
    ]
      .filter(Boolean)
      .concat(formDescriptions)
      .map((desc) => desc
        .replace(/(\s|^)Forme?(\s|$)/ig, '')
        .replace(new RegExp(`(\\s|^)${name}(\\s|$)`, 'ig'), '')
        .trim()
      )
      .map((formName) => {
        const code = formName.toLocaleLowerCase().replace(/\s+/, '-');
        const alt = code === 'mega'
          ? / ([XY])$/.exec(name)?.[1]?.toLocaleLowerCase() ?? null
          : null;

        return {
          name: formName,
          code,
          id: [code, alt].filter(Boolean).join('-')
        }
      });

    const id = [number, ...forms.map((form) => form.id)].filter(Boolean).join('-');

    const types = [...row.children[3].querySelectorAll('a')].map((a) => TYPE_IMG_SRC_REGEX.exec(a.children[0].getAttribute('src')!)![1]);

    const statDoc = row.children[4].querySelectorAll('table tr');
    const stats: Stats = {
      hp: Number(statDoc[0].children[1].textContent.trim()),
      attack: Number(statDoc[1].children[1].textContent.trim()),
      defence: Number(statDoc[2].children[1].textContent.trim())
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
      number,
      forms,
      image,
      name,
      types,
      stats,
      moves
    };
  }
}
