import * as path from "https://deno.land/std@0.77.0/path/mod.ts";
import makeloc from 'https://deno.land/x/dirname@1.1.2/mod.ts';

const { __dirname } = makeloc(import.meta);

const DATA_PATH = path.join(__dirname, '../api/data').slice(1)

export {
  DATA_PATH
};
