import * as png from "https://deno.land/x/png@v0.0.1/mod.ts";
import * as gif from './gif.ts';

export function readDimensions(path: string, format: 'png' | 'gif') {
  switch (format) {
    case 'png': return png.readDimensions(path);
    case 'gif': return gif.readDimensions(path);
  }
}
