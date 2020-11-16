import { DownlodedFile } from "https://deno.land/x/download@v1.0.1/types.ts";

import * as png from "./png.ts";
import * as gif from './gif.ts';

async function readImageDimensions(path: string, format: 'png' | 'gif') {
  switch (format) {
    case 'png': return await png.readDimensions(path);
    case 'gif': return await gif.readDimensions(path);
  }
}

export async function resolveImageRecord(file: DownlodedFile | null, format: 'png' | 'gif') {
  if (!file) return;

  const {width, height} = await readImageDimensions(file.fullPath, format);

  return {
    url: file?.file ? `images/${file.file}` : null,
    width,
    height
  };
}
