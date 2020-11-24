import { BinaryReader } from 'https://deno.land/x/binary_reader@v0.1.4/mod.ts';

const SIG = 'GIF';

export function validSignature(reader: BinaryReader) {
  const signature = reader.readString(3);
  const version = reader.readBytes(3);

  const valid = signature === SIG;
  return valid;
}

export async function readDimensions(reader: BinaryReader) {
  const width = reader.readUint16(true);
  const height = reader.readUint16(true);

  return {
    width,
    height
  }
}

export async function isGif(reader: BinaryReader) {
  reader.seek(0);
  return validSignature(reader);
}
