import makeloc from 'https://deno.land/x/dirname@1.1.2/mod.ts'

const { __dirname,  __filename } = makeloc(import.meta);
export {__dirname, __filename};
