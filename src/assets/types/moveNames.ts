// import { parse } from "https://deno.land/std@0.78.0/encoding/csv.ts";

// import { URL_ASSETS_RAW } from '../const.ts';

// const ASSET_KEY_MOVE_NAME = /^move_name_(\d+)$/

// export interface IAssetMoveName {
//   key: string;
//   value: string;
// }

// export async function * getAssetMoveNames(): AsyncGenerator<IAssetMoveName> {
//   const url = new URL('master/decrypted_assets/txt/moves.txt', URL_ASSETS_RAW);
//   const resp = await fetch(url.href);
//   const text = await resp.text();
//   const csv = await parse(text, {
//     separator: '\t'
//   }) as string[][];

//   for (const row of csv) {
//     if (!ASSET_KEY_MOVE_NAME.test(row[0])) continue;

//     yield {
//       key: row[0],
//       value: row[1]
//     };
//   }
// }
