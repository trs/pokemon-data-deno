import makeloc from 'https://deno.land/x/dirname@1.1.2/mod.ts'

const { __dirname } = makeloc(import.meta);

const DATA_PATH = `${__dirname}/data`;

export {
  DATA_PATH
};
