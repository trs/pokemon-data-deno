import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {API_URL} from './const.ts';

const TYPE_DESC_REGEX = /^\w+ → (\w+) = ([\w- ]+$)/

export interface TypeEffectiveness {
  multiplier: number;
  description: string;
}

export interface Type {
  name: string;
  effectiveness: Map<string, TypeEffectiveness>;
}

export async function * getTypes(): AsyncGenerator<Type> {
  const url = new URL('/go/type', API_URL);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const row of doc.querySelectorAll('.type-table tbody tr')) {
    const name = row.children[0].textContent;
    const effectiveness = new Map<string, TypeEffectiveness>();

    for (const col of row.children) {
      const title = col.attributes.getNamedItem('title').value;
      if (!title) continue;

      const [, defender, description] = TYPE_DESC_REGEX.exec(title)!;
      const multiplier = Number(col.textContent);

      effectiveness.set(defender, {
        description,
        multiplier
      });
    }

    yield {
      name,
      effectiveness
    };
  }
}
