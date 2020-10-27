import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {API_URL} from './const.ts';

export interface Move {
  name: string;
  type: string;
  category: string;
  bars: number;
  power: number;
  powerPVP: number;
}

export async function * getMoves(): AsyncGenerator<Move> {
  const url = new URL('/go/move', API_URL);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser();
  const doc = dom.parseFromString(html, 'text/html')!;

  for (const moveNode of doc.querySelectorAll('#moves tbody tr')) {
    const name = moveNode.children[0].textContent;
    const type = moveNode.children[1].textContent;
    const category = moveNode.children[2].textContent;
    const bars = Number(moveNode.children[3].attributes.getNamedItem('data-sort-value').value);
    const power = Number(moveNode.children[4].textContent);
    const powerPVP = Number(moveNode.children[5].textContent);

    yield {
      name,
      type,
      category,
      bars,
      power,
      powerPVP
    };
  }
}
