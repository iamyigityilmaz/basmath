import { pixToRGBA } from '../src/art/pix.js';
import { ROOMS } from '../src/art/rooms.js';
import { writePixPNG } from './png.mjs';
const dir = process.argv[2];
for (const k of Object.keys(ROOMS)) writePixPNG(`${dir}/${k}.png`, ROOMS[k]().scaled(2), pixToRGBA);
console.log('ok');
