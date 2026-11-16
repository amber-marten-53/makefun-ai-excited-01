import * as fs from 'fs';
import * as zlib from 'zlib';
import * as path from 'path';

const width = 400;
const height = 300;

function createPng(): Buffer {
    const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    
    // IDAT
    const data = Buffer.alloc(height * (1 + width * 3));
    for (let y = 0; y < height; y++) {
        data[y * (1 + width * 3)] = 0; // Filter
        for (let x = 0; x < width; x++) {
            const i = y * (1 + width * 3) + 1 + x * 3;
            // 99% progress meme
            const isFilled = x < width * 0.99;
            data[i] = isFilled ? 255 : 200;
            data[i+1] = isFilled ? 165 : 200;
            data[i+2] = 0;
        }
    }
    
    const idatData = zlib.deflateSync(data);
    
    function makeChunk(type: string, data: Buffer): Buffer {
        const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
        const t = Buffer.from(type);
        const buf = Buffer.concat([len, t, data]);
        // Simple CRC32, standard implementation
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < buf.length; i++) {
            crc ^= buf[i];
            for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
        }
        const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc >>> 0);
        return Buffer.concat([buf, crcBuf]);
    }
    
    return Buffer.concat([
        header,
        makeChunk('IHDR', ihdr),
        makeChunk('IDAT', idatData),
        makeChunk('IEND', Buffer.alloc(0))
    ]);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '.';
fs.writeFileSync(path.join(outDir, 'entry.png'), createPng());
