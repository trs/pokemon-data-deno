import { IAssetTexts } from '../texts.ts';

const ASSET_KEY_POKEMON_TYPE = /^pokemon_type_(.+)$/

export type IAssetPokemonTypeNameMap = Map<string, IAssetPokemonTypeName>;

export interface IAssetPokemonTypeName {
  type: string;
  name: string;
}

export async function getAssetPokemonTypeNames(texts: IAssetTexts): Promise<IAssetPokemonTypeNameMap> {
  const map = new Map<string, IAssetPokemonTypeName>();
  for (const [key, value] of texts.entries()) {
    if (!ASSET_KEY_POKEMON_TYPE.test(key)) continue;
    const type = key.toLocaleUpperCase();

    const asset: IAssetPokemonTypeName = map.get(type) ?? {type, name: ''};
    asset.name = value;

    map.set(type, asset);
  }

  return map;
}
