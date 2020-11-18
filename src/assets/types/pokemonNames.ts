import { IAssetTexts } from '../texts.ts';

const ASSET_KEY_POKEMON_NAME = /^pokemon_(name)_(\d+)$/
const ASSET_KEY_POKEMON_DESC = /^pokemon_(desc)_(\d+)$/
const ASSET_KEY_POKEMON_CATEGORY = /^pokemon_(category)_(\d+)$/

export type IAssetPokemonNameMap = Map<number, IAssetPokemonName>;

export interface IAssetPokemonName {
  number: number;
  name: string;
  desc: string;
  category: string;
}

export async function getAssetPokemonNames(texts: IAssetTexts): Promise<IAssetPokemonNameMap> {
  const map = new Map<number, IAssetPokemonName>();
  for (const [key, value] of texts.entries()) {
    const [, prop, numStr] = (
      ASSET_KEY_POKEMON_NAME.exec(key)
      ?? ASSET_KEY_POKEMON_DESC.exec(key)
      ?? ASSET_KEY_POKEMON_CATEGORY.exec(key)
      ?? []
    ) as unknown as [null, 'name' | 'desc' | 'category', string];
    if (!prop || !numStr) continue;
    const number = Number(numStr);

    const asset: IAssetPokemonName = map.get(number) ?? {number, name: '', desc: '', category: ''};
    asset[prop] = value;

    map.set(number, asset);
  }

  return map;
}
