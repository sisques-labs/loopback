/**
 * A minimal valid ZIP archive containing a single `index.js` file that exports
 * a stub Lambda handler. Built once at module load using node:zlib so there is
 * nothing to bundle or path-resolve at runtime.
 *
 * Used as `Code.ZipFile` in CreateFunctionCommand so the function is immediately
 * invokable after creation. LocalStack accepts arbitrary valid zip content for
 * any runtime.
 */
import { deflateRawSync } from "node:zlib";

function buildStubZip(): Buffer {
  const content = Buffer.from(
    'exports.handler = async () => ({ statusCode: 200, body: "stub" });',
    "utf-8",
  );
  const fileName = Buffer.from("index.js", "utf-8");

  const compressed = deflateRawSync(content, { level: 9 });

  const crc32 = computeCrc32(content);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32LE(crc32, 0);

  // Local file header
  const localHeader = Buffer.alloc(30 + fileName.length);
  localHeader.writeUInt32LE(0x04034b50, 0); // signature
  localHeader.writeUInt16LE(20, 4);         // version needed
  localHeader.writeUInt16LE(0, 6);          // flags
  localHeader.writeUInt16LE(8, 8);          // compression method: deflate
  localHeader.writeUInt16LE(0, 10);         // last mod time
  localHeader.writeUInt16LE(0, 12);         // last mod date
  crcBuf.copy(localHeader, 14);             // crc-32
  localHeader.writeUInt32LE(compressed.length, 18); // compressed size
  localHeader.writeUInt32LE(content.length, 22);    // uncompressed size
  localHeader.writeUInt16LE(fileName.length, 26);   // file name length
  localHeader.writeUInt16LE(0, 28);                 // extra field length
  fileName.copy(localHeader, 30);

  const localOffset = 0;

  // Central directory header
  const centralHeader = Buffer.alloc(46 + fileName.length);
  centralHeader.writeUInt32LE(0x02014b50, 0); // signature
  centralHeader.writeUInt16LE(20, 4);          // version made by
  centralHeader.writeUInt16LE(20, 6);          // version needed
  centralHeader.writeUInt16LE(0, 8);           // flags
  centralHeader.writeUInt16LE(8, 10);          // compression method
  centralHeader.writeUInt16LE(0, 12);          // last mod time
  centralHeader.writeUInt16LE(0, 14);          // last mod date
  crcBuf.copy(centralHeader, 16);             // crc-32
  centralHeader.writeUInt32LE(compressed.length, 20); // compressed size
  centralHeader.writeUInt32LE(content.length, 24);    // uncompressed size
  centralHeader.writeUInt16LE(fileName.length, 28);   // file name length
  centralHeader.writeUInt16LE(0, 30);                 // extra field length
  centralHeader.writeUInt16LE(0, 32);                 // file comment length
  centralHeader.writeUInt16LE(0, 34);                 // disk number start
  centralHeader.writeUInt16LE(0, 36);                 // internal attributes
  centralHeader.writeUInt32LE(0, 38);                 // external attributes
  centralHeader.writeUInt32LE(localOffset, 42);       // relative offset of local header
  fileName.copy(centralHeader, 46);

  const dataSize = localHeader.length + compressed.length;
  const centralOffset = dataSize;
  const centralSize = centralHeader.length;

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // disk with central dir
  eocd.writeUInt16LE(1, 8);          // entries on disk
  eocd.writeUInt16LE(1, 10);         // total entries
  eocd.writeUInt32LE(centralSize, 12); // central dir size
  eocd.writeUInt32LE(centralOffset, 16); // central dir offset
  eocd.writeUInt16LE(0, 20);         // comment length

  return Buffer.concat([localHeader, compressed, centralHeader, eocd]);
}

/** CRC-32 using the standard polynomial (0xEDB88320). */
function computeCrc32(data: Buffer): number {
  const table = getCrc32Table();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crc32Table: Uint32Array | undefined;
function getCrc32Table(): Uint32Array {
  if (_crc32Table) return _crc32Table;
  _crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    _crc32Table[i] = c;
  }
  return _crc32Table;
}

export const STUB_ZIP_BUFFER: Buffer = buildStubZip();
