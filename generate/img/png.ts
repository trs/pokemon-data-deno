import { BinaryReader } from 'https://deno.land/x/binary_reader@v0.1.4/mod.ts';

const SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function validSignature(reader: BinaryReader) {
  const signature = reader.readBytes(8);

  if (signature.length !== SIG.length) return false;

  for (let i = 0; i < SIG.length; i++) {
    if (signature[i] !== SIG[i]) return false;
  }
  return true;
}

function readChunk(reader: BinaryReader) {
  const length = reader.readUint32();
  const type = reader.readString(4);
  const data = new BinaryReader(reader.readBytes(length));
  const crc = reader.readBytes(4);

  return {
    length,
    type,
    data,
    crc
  };
}

function readIHDR(reader: BinaryReader) {
  const chunk = readChunk(reader);
  if (chunk.type !== 'IHDR') {
    throw new Error(`Expected IHDR, got ${chunk.type}`);
  }

  const width = chunk.data.readUint32();
  const height = chunk.data.readUint32();

  return {
    width,
    height
  };
}

export async function readDimensions(reader: BinaryReader) {
  const ihdr = readIHDR(reader);

  return {
    width: ihdr.width,
    height: ihdr.height
  };
}

export function isPng(reader: BinaryReader) {
  reader.seek(0);
  return validSignature(reader)
}
