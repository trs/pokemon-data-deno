import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import {API_URL} from './const.ts';

const TYPE_DESC_REGEX = /(\w+) → (\w+) = ([\w-]+)/

interface Effectiveness {
  type: string;
  effectiveness: string;
  value: number;
}

export async function getTypeEffectiveness() {
  const url = new URL('/type', API_URL);
  const resp = await fetch(url.href);
  const html = await resp.text();

  const dom = new DOMParser()
  const doc = dom.parseFromString(html, 'text/html')!;

  const attackerTypes = new Map<string, Effectiveness[]>();
  const defenderTypes = new Map<string, Effectiveness[]>();

  for (const row of doc.querySelectorAll('.type-table tbody tr')) {
    for (const col of row.children) {
      const desc = col.attributes.getNamedItem('title').value;
      if (!desc) continue;

      const value = (() => {
        switch (col.textContent) {
          case '½': return 0.5;
          case '': return 1;
          default: return Number(col.textContent);
        }
      })();

      const [, attacker, defender, effectiveness] = TYPE_DESC_REGEX.exec(desc)!;

      if (!attackerTypes.has(attacker)) attackerTypes.set(attacker, []);
      if (!defenderTypes.has(defender)) defenderTypes.set(defender, []);

      attackerTypes.set(attacker, [...attackerTypes.get(attacker)!, {type: defender, effectiveness, value}]);
      defenderTypes.set(defender, [...defenderTypes.get(defender)!, {type: attacker, effectiveness, value}]);
    }
  }

  return {
    attackerTypes,
    defenderTypes
  };
}

const result = await getTypeEffectiveness();

console.log(Object.fromEntries(result.attackerTypes.entries()));
console.log(Object.fromEntries(result.defenderTypes.entries()));
