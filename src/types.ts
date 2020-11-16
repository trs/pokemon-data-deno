import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {URL_PKMNDB} from './const.ts';

const TYPE_DESC_REGEX = /^\w+ → (\w+) = ([\w- ]+$)/

export interface PokemonTypeEffectiveness {
  multiplier: number;
  description: string;
}

export interface PokemonType {
  name: string;
  effectiveness: Record<string, PokemonTypeEffectiveness>;
}

export async function * getTypes(): AsyncGenerator<PokemonType> {
  const url = new URL('/go/type', URL_PKMNDB);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const row of doc.querySelectorAll('.type-table tbody tr')) {
    const name = row.children[0].textContent;
    const effectiveness = new Map<string, PokemonTypeEffectiveness>();

    for (const col of row.children) {
      const title = col.attributes.getNamedItem('title').value;
      if (!title) continue;

      const [, defender, description] = TYPE_DESC_REGEX.exec(title)!;
      const multiplier = Number(col.textContent || '1');

      effectiveness.set(defender, {
        description,
        multiplier
      });
    }

    yield {
      name,
      effectiveness: Object.fromEntries(effectiveness.entries())
    };
  }
}
