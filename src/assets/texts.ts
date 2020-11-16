import { URL_ASSETS } from '../const.ts';

export type IAssetTexts = Map<string, string>;

export async function getAssetTexts(language: 'english' = 'english'): Promise<IAssetTexts> {
  const url = new URL(`master/Texts/Latest APK/JSON/i18n_${language}.json`, URL_ASSETS);
  const resp = await fetch(url.href);
  const json = await resp.json() as {data: string[]};

  const map = new Map<string, string>();
  for (let i = 0; i < json.data.length; i++) {
    const key = json.data[i];
    const value = json.data[++i];

    map.set(key, value);
  }

  return map;
}
