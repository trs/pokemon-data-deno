import { IAssetTexts } from '../texts.ts';

const ASSET_KEY_POKEMON_NAME = /^pokemon_(name)_(\d+)$/
const ASSET_KEY_POKEMON_DESC = /^pokemon_(desc)_(\d+)$/
const ASSET_KEY_POKEMON_CATEGORY = /^pokemon_(category)_(\d+)$/

export type IAssetPokemonNameMap = Map<number, IAssetPokemonName>;

export interface IAssetPokemonName {
  dex: number;
  name: string;
  desc: string;
  category: string;
}

export async function getAssetPokemonNames(texts: IAssetTexts): Promise<IAssetPokemonNameMap> {
  const map = new Map<number, IAssetPokemonName>();
  for (const [key, value] of texts.entries()) {
    const [, prop, dexStr] = (
      ASSET_KEY_POKEMON_NAME.exec(key)
      ?? ASSET_KEY_POKEMON_DESC.exec(key)
      ?? ASSET_KEY_POKEMON_CATEGORY.exec(key)
      ?? []
    ) as unknown as [null, 'name' | 'desc' | 'category', string];
    if (!prop || !dexStr) continue;
    const dex = Number(dexStr);

    const asset: IAssetPokemonName = map.get(dex) ?? {dex, name: '', desc: '', category: ''};
    asset[prop] = value;

    map.set(dex, asset);
  }

  return map;
}
