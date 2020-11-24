import { DownlodedFile } from "https://deno.land/x/download@v1.0.1/types.ts";
import { BinaryReader } from 'https://deno.land/x/binary_reader@v0.1.4/mod.ts';

import * as png from "./png.ts";
import * as gif from './gif.ts';

async function readImageDimensions(path: string) {
  const buffer = await Deno.readFile(path);
  const reader = new BinaryReader(buffer);

  if (png.isPng(reader)) return await png.readDimensions(reader);
  else if (gif.isGif(reader)) return await gif.readDimensions(reader);
  else return {
    width: 0,
    height: 0
  }
}

export async function resolveImageRecord(file: DownlodedFile | null) {
  if (!file) return;

  const {width, height} = await readImageDimensions(file.fullPath);

  if (width === 0 || height === 0) {
    console.log('invalid size', file.file)
  }

  return {
    url: file?.file ? `img/${file.file}` : null,
    width,
    height
  };
}
