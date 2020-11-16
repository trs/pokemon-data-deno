import { Destination, download, DownlodedFile } from "https://deno.land/x/download@v1.0.1/mod.ts";

import { URL_ASSETS } from '../../const.ts';

export async function getAssetPokemonIcon(assetId: string, destination: Destination, shiny?: boolean): Promise<DownlodedFile | null> {
  const url = new URL(`master/Images/Pokemon/pokemon_icon_${assetId}${shiny ? '_shiny' : ''}.png`, URL_ASSETS);
  try {
    const file = await download(url.href, destination);
    return file;
  } catch (err) {
    console.error(err.message);
    console.info(url.href);
    return null;
  }
}
