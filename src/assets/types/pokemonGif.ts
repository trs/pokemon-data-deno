import { Destination, download, DownlodedFile } from "https://deno.land/x/download@v1.0.1/mod.ts";
import { camelCase } from 'https://deno.land/x/case@v2.1.0/mod.ts';

import { URL_PROJECT } from '../../const.ts';

export async function getAssetPokemonGif(name: string, forms: string[], destination: Destination, shiny?: boolean): Promise<DownlodedFile | null> {
  const file = formatAssetPokemonGifName(name, forms, shiny);

  const type = shiny ? 'shiny' : 'normal';

  const urls = [
    new URL(`images/${type}-sprite/${file}.gif`, URL_PROJECT).href,
    new URL(`images/sprites-models/swsh-${type}-sprites/${file}.gif`, URL_PROJECT).href,
  ];

  const tryDownload = async (url: string, tries = 0): Promise<DownlodedFile | null> => {
    try {
      const file = await download(url, destination);
      return file;
    } catch (err) {
      if (tries > 2) return null;
      return tryDownload(url, tries + 1);
    }
  };

  for (const url of urls) {
    const file = await tryDownload(url);
    if (!file) continue;

    return file;
  }

  console.error('404');
  console.info(name, urls);
  return null;
}

export function formatAssetPokemonGifName(name: string, forms: string[], shiny?: boolean) {
  name = name.toLocaleLowerCase()
    .replace('\'', '')
    .replace('♀', '_f')
    .replace('♂', '_m')
    .replace('mr. mime', shiny ? 'mr._mime' : 'mr.mime')
    .replace('mime jr.', 'mime_jr');

  return [
    name,
    ...forms.map((form) => {
      let value = camelCase(form).toLocaleLowerCase()
        .replace('galarian', 'galar')
        .replace('burn', 'fire')
        .replace('chill', 'ice')
        .replace('douse', 'water')
        .replace('shock', 'electric')
        .replace('bluestriped', 'blue')
        .replace('eastsea', 'east')
        .replace('redstriped', '')
        .replace('overcast', '')
        .replace('plant', '')
        .replace('westsea', '')
        .replace('normal', '')
        .replace('standard', '')
        .replace('ordinary', '')
        .replace('altered', '')
        .replace('land', '')
        .replace('spring', '')
        .replace('aria', '')
        .replace('incarnate', '')
        .replace('female', '');

      switch (name) {
        case 'castform': {
          value = value.replace('sunshine', 'sunny');
          break;
        }
        case 'cherrim': {
          value = value.replace('sunny', 'sunshine');
          break;
        }
      }
      return value;
    })
  ]
  .filter(Boolean)
  .join('-');
}
