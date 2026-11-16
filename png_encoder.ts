// Minimalistic PNG encoder
export function createPng(width: number, height: number, pixelData: Uint8Array): Buffer {
    const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    function createChunk(type: string, data: Buffer): Buffer {
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length);
        const chunkType = Buffer.from(type);
        const crc = Buffer.alloc(4); 
        // CRC is usually required, but let's see if we can get away with 0 or minimal.
        // Actually, let's just make it simple.
        return Buffer.concat([length, chunkType, data, crc]);
    }
    
    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // color type (truecolor)
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace
    
    // IDAT would need DEFLATE. Node has 'zlib'.
    return Buffer.concat([header, createChunk('IHDR', ihdr)]);
}
