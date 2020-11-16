import { BinaryReader } from 'https://deno.land/x/binary_reader@v0.1.4/mod.ts';

const SIG = 'GIF';

function validSignature(reader: BinaryReader) {
  const signature = reader.readString(3);
  const version = reader.readBytes(3);

  const valid = signature === SIG;
  if (!valid) console.log({signature})
  return valid;
}

async function loadGIF(filePath: string) {
  const buffer = await Deno.readFile(filePath);
  const reader = new BinaryReader(buffer);

  // if (!validSignature(reader)) {
  //   throw new Error('Not a valid GIF');
  // }

  return reader;
}

export async function readDimensions(filePath: string) {
  const reader = await loadGIF(filePath);

  const width = reader.readUint16(true);
  const height = reader.readUint16(true);

  return {
    width,
    height
  }
}
