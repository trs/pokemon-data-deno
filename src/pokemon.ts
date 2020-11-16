import { normalizeSync } from "https://cdn.jsdelivr.net/gh/motss/deno_mod@v0.10.0/normalize_diacritics/mod.ts";

import {buildFormIDRegex, PokemonMoveCategory, URL_HUB, URL_PROJECT, URL_ASSETS} from './const.ts';
import type { PokedexEntry } from "./pokedex.ts";

export interface Pokemon extends PokedexEntry {
  images: PokemonImage[];
  stats: PokemonStats;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defence: number;
}

export interface PokemonMoveset {
  category: PokemonMoveCategory;
  name: string;
}

export interface PokemonImage {
  category: 'sprite' | 'model' | 'art';
  type: 'png' | 'gif';
  variant: 'shiny' | 'normal';
  urls: string[];
}

export async function getPokemon(id: number, form: string | null, gm?: any): Promise<Pokemon> {
  const url = new URL(`api/pokemon/${id}`, URL_HUB);
  url.searchParams.append('form', form ?? '');

  const result = await fetch(url.href);
  const pokemon = await result.json();

  // Fixes
  pokemon.name = pokemon.name === 'Cherim' ? 'Cherrim' : pokemon.name;

  const formCode = pokemon.form?.toLocaleLowerCase()?.replace(/\s/, '-');

  return {
    id: [pokemon.id, formCode].filter(Boolean).join('-'),
    number: pokemon.id,
    name: pokemon.name,
    form: pokemon.form ? {
      name: pokemon.form,
      code: formCode
    } : null,
    types: [pokemon.type1, pokemon.type2].filter(Boolean),
    generation: pokemon.generation,
    stats: {
      attack: pokemon.atk,
      defence: pokemon.def,
      hp: pokemon.sta
    },
    images: [
      ...getGifs(pokemon),
      ...(gm ? getImages(pokemon, gm) : [])
    ]
  }
}

function getGifs(json: any): PokemonImage[] {
  const name = [
    normalizeSync(json.name.trim().toLocaleLowerCase())
      .replace('♀', '_f')
      .replace('♂', '_m')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s/g, '-')
      .replace('tapu-', 'tapu')
      .replace('mr-mime', 'mr.mime')
      .replace('mime-jr', 'mime_jr')
    ,
    json.form?.trim()?.toLocaleLowerCase()
      ?.replace(/\s/g, '')
      ?.replace('galarianstandard', 'galarian')
      ?.replace('galarianzen', 'zen-galarian')
      ?.replace('galarian', 'galar')
      ?.replace('burn', 'fire')
      ?.replace('chill', 'ice')
      ?.replace('douse', 'water')
      ?.replace('shock', 'electric')
      ?.replace('sunny', 'sunshine')
      ?.replace('bluestriped', 'blue')
      ?.replace('redstriped', '')
      ?.replace('overcast', '')
      ?.replace('plant', '')
      ?.replace('west', '')
      ?.replace('normal', '')
      ?.replace('standard', '')
      ?.replace('ordinary', '')
      ?.replace('altered', '')
      ?.replace('land', '')
      ?.replace('spring', '')
      ?.replace('aria', '')
  ]
    .filter(Boolean)
    .join('-');

  return [
    {
      category: 'model',
      type: 'gif',
      urls: [
        new URL(`images/normal-sprite/${name}.gif`, URL_PROJECT).href,
        new URL(`images/sprites-models/swsh-normal-sprites/${name}.gif`, URL_PROJECT).href,
      ],
      variant: 'normal'
    },
    {
      category: 'model',
      type: 'gif',
      urls: [
        new URL(`images/shiny-sprite/${name === 'mr.mime' ? 'mr._mime' : name}.gif`, URL_PROJECT).href,
        new URL(`images/sprites-models/swsh-shiny-sprites/${name === 'mr.mime' ? 'mr._mime' : name}.gif`, URL_PROJECT).href
      ],
      variant: 'shiny'
    }
  ]
}

function getImages(json: any, gm: any): PokemonImage[] {
  const formIdRegex = buildFormIDRegex(json.id);
  const formTemplate = gm.template.find((template: any) => formIdRegex.test(template.templateId));

  const extractFormNameRegex = new RegExp(`${normalizeSync(json.name.trim())}_`, 'i');

  const formData = json.form
    ? (formTemplate.data?.formSettings?.forms ?? [])
      .find((data: any) => {
        const name = data.form.replace(extractFormNameRegex, '');
        return name.toLocaleLowerCase() === json.form.toLocaleLowerCase();
      })
    : null;

  const name = [
    String(json.id).padStart(3, '0'),
    formData?.assetBundleValue ?? '00'
  ].filter(Boolean).join('_');

  return [
    {
      category: 'model',
      type: 'png',
      urls: [
        new URL(`raw/master/pokemon_icons/pokemon_icon_${name}.png`, URL_ASSETS).href,
        new URL(`raw/master/pokemon_icons/pokemon_icon_000.png`, URL_ASSETS).href
      ],
      variant: 'normal'
    },
    {
      category: 'model',
      type: 'png',
      urls: [
        new URL(`raw/master/pokemon_icons/pokemon_icon_${name}_shiny.png`, URL_ASSETS).href,
        new URL(`raw/master/pokemon_icons/pokemon_icon_000.png`, URL_ASSETS).href
      ],
      variant: 'shiny'
    }
  ];
}
