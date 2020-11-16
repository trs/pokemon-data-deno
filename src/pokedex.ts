import { URL_HUB} from './const.ts';

export interface PokemonForm {
  name: string;
  code: string;
}

export interface PokedexEntry {
  id: string;
  number: number;
  name: string;
  form: PokemonForm | null;
  types: string[];
  generation: number;
}

export async function * getPokedex(): AsyncGenerator<PokedexEntry> {
  for (let gen = 1; gen <= 8; gen++) {
    yield * getPokedexGeneration(gen);
  }
}

export async function * getPokedexGeneration(generation: number): AsyncGenerator<PokedexEntry> {
  const url = new URL(`api/pokemon/with-generation/${generation}`, URL_HUB);

  const result = await fetch(url.href);
  const json = await result.json();

  for (const pokemon of json) {
    const formCode = pokemon.form?.toLocaleLowerCase()?.replace(/\s/, '-');

    yield {
      id: [pokemon.id, formCode].filter(Boolean).join('-'),
      number: pokemon.id,
      name: pokemon.name,
      form: pokemon.form ? {
        name: pokemon.form,
        code: formCode
      } : null,
      types: [pokemon.type1, pokemon.type2].filter(Boolean),
      generation: pokemon.generation
    };
  }
}
