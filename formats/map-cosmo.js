/*
 * Map handler for Cosmo's Cosmic Adventures.
 *
 * This file format is fully documented on the ModdingWiki:
 *   http://www.shikadi.net/moddingwiki/Cosmo_Level_Format
 *
 * Copyright (C) 2010-2021 Adam Nielsen <malvineous@shikadi.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const FORMAT_ID = 'map-cosmo';

import Debug from '../util/debug.js';
const debug = Debug.extend(FORMAT_ID);

import { RecordBuffer, RecordType } from '@camoto/record-io-buffer';
import MapHandler from '../interface/mapHandler.js';
import {
	Map2D,
	Map2D_Layer_List,
	Map2D_Layer_Tiled,
	Item,
	Item_Map2D_Layer_List,
} from '../interface/index.js';

const recordTypes = {
	header: {
		flags: RecordType.int.u16le,
		mapWidth: RecordType.int.u16le,
		lenActorChunk: RecordType.int.u16le,
	},
	actor: {
		type: RecordType.int.u16le,
		x: RecordType.int.u16le,
		y: RecordType.int.u16le,
	},
};

const HEADER_LEN = 6;
const ACTOR_LEN = 6;
const ACTOR_LEN_UINT16 = ACTOR_LEN / 2;

// Actor layer limits.
const MAX_PLAYERS = 1;
const MAX_PLATFORMS = 10;
const MAX_LIGHTS = 199;
// Although technically the game can store 10922 actors (a 65535-byte memory
// block divided by the 6-byte actor structure) it stops reading the block
// after actor #410, discarding the rest of the data.
const MAX_ACTORS = 410;

// Number of tiles in the background layer.
const COSMO_BG_LEN = 32764;

// Width limits of BG layer.  Minimums are one screen/viewport in size.
const COSMO_BG_MIN_X = 38;
const COSMO_BG_MIN_Y = 18;
const COSMO_BG_MAX_X = COSMO_BG_LEN / COSMO_BG_MIN_Y;
const COSMO_BG_MAX_Y = COSMO_BG_LEN / COSMO_BG_MIN_X;

const COSMO_BG_TILE_WIDTH = 8;
const COSMO_BG_TILE_HEIGHT = 8;

class Layer_CosmoBG extends Map2D_Layer_Tiled
{
	constructor(tiles) {
		const mapW = tiles[0].length;
		const mapH = tiles.length;
		super({
			title: 'Background',
			limits: {
				minLayerX: COSMO_BG_MIN_X,
				minLayerY: COSMO_BG_MIN_Y,
				maxLayerX: COSMO_BG_MAX_X,
				maxLayerY: COSMO_BG_MAX_Y,
			},
			layerW: mapW,
			layerH: mapH,
			tileW: COSMO_BG_TILE_WIDTH,
			tileH: COSMO_BG_TILE_HEIGHT,
			tiles,
		});
	}

	isPermittedAt(x, y, item) {
		const offset = y * map.size.x + y;
		if (offset > COSMO_BG_LEN) {
			return {
				valid: false,
				reason: `Tile offset (${offset}) is larger than the maximum `
					+ `(${COSMO_BG_LEN}) supported by the game.`,
			};
		}

		return true;
	}

	imageFromCode(code) {
		if (code >= 2000) {
			return this.tilesetFG.clone(code - 2000, 1);
		} else {
			return this.tilesetBG.clone(code || 0, 1);
		}
	}
}

class Layer_CosmoActors extends Map2D_Layer_List
{
	constructor(actors) {
		super();

		for (const actor of actors) {
			let item = new Item_Map2D_Layer_List();
			item.x = actor.x;
			item.y = actor.y;
			item.code = actor.code;
			item.display = this.displayFromActorType(actor.code);
			if (item.display.x) item.display.x *= COSMO_BG_TILE_WIDTH;
			if (item.display.y) item.display.y *= COSMO_BG_TILE_HEIGHT;
			this.items.push(item);
		}
	}

	displayFromActorType(code) {
		let display = [
			{ i: code - 31 },
		];
		const makeCrate = n => {
			display = [
				{ i: 0 },
				{ i: n || display[0].i },
			];
		}
		const makeBarrel = n => {
			display = [
				{ i: 29 },
				{ i: n || display[0].i },
			];
		}

		switch (code) {
				// 31..34 ok
			case 35: display[0].x = -4; break;
				// 36 ok
			case 37: display[0].x = -1; break;
			case 38: display[0].y = 1; break;
			case 39: display[0].y = 1; break;
			case 40: display[0].y = 1; break;
			case 41: display[0].y = 1; break;
				// 42..46 ok
			case 47: display[0].i = 16; break;
			case 48: display[0].i = 17; break;
			case 49: display[0].i = 18; break;
				// 50?
			case 51: display[1] = { icon: Item.Icons.UpDownArrow }; break;
				// 52?
			case 53: display[0].i = 20; display[1] = { icon: Item.Icons.LeftRightArrow }; break;
				// 54?
				// 55 ok
				// 56 ok
				// 57?
				// 58?
				// 59 ok
			case 60: makeBarrel(28); break;
				// 61?
			case 62: makeCrate(32); break;
			case 63: display[1] = { icon: Item.Icons.DownArrow }; break; // falling
			case 64: makeCrate(33); break;
			case 65: display[0].i = 33 /* not 34? */; display[1] = { icon: Item.Icons.DownArrow }; break; // falling
			case 66: makeCrate(36); break;
			case 67: display[1] = { icon: Item.Icons.DownArrow }; break; // falling
			case 68: makeCrate(38); break;
			case 69: display[1] = { icon: Item.Icons.DownArrow }; break; // falling
				// 70 ok
			case 71: display[1] = { icon: Item.Icons.DownArrow }; break; // coming down from ceiling
				// 72 ok
			case 73: display[0].y = 1; display[0].i++; break;
			case 74: display[0].y = 1; break;
				// 75..78 ok
			case 79: display[0].y = 1; display[0].i++; break;
			case 80: display[0].y = 1; break;
			case 81: display[0].i--; display[0].yMirror = true; break;
				// 82 ok
			case 83: makeCrate(135); break;
			case 84: makeCrate(136); break;
				// 85 ok
				// 86 ok
			case 87: makeBarrel(57); break;
				// 88 ok
			case 89: makeBarrel(2); break;
			case 90: display[0].i++; break;
				// 91?
			case 92: display[0].i--; break;
				// 93..96 ok
			case 97: display[0].i+=2; display[1] = { icon: Item.Icons.DownLeftDiagArrow }; break; // moving south-west
			case 98: display[0].i++; display[1] = { icon: Item.Icons.DownRightDiagArrow }; break; // moving south-east
			case 99: display[1] = { icon: Item.Icons.DownArrow }; break; // moving south
				// 100..104 ok
			case 105: display[0].i--; display[1] = { i: 70 }; break; // TODO: Replace overlay with Cosmo's head
				// 106 ok
				// 107?
				// 108?
				// 109 ok
				// 110?
			case 111: display[0].y = 2; break;
			case 112: makeCrate(82); break;
				// 113..114 ok
			case 115: display[0].i--; display[0].y = 2; display[0].yMirror = true; break;
			case 116: display[0].y = 2; break;
				// 117..119 ok
			case 120: display[0].x = -3; break;
				// 121..123 ok
			case 112: makeCrate(94); break;
				// 125..126 ok
			case 127: display[0].i--; display[0].y = 2; display[0].yMirror = true; break;
				// 128?
				// 129?
				// 130?
			case 131: makeBarrel(251); break;
				// 132..133 ok

				// TODO: Finish adding the rest of these

			// Unknown actor type, show actor code like "FF?".
			default: display[0] = { text: code.toString(16) + '?' };
		}

		return display;
	}

	imageFromCode(code) {
		//return this.tileset.clone(code || 0, 1);
		return null; // TEMP
	}
}

class Map2D_Cosmo extends Map2D
{
	constructor(bgTileCodes, actors) {
		super({});

		this.limits = {
			...this.limits,
			minimumTileSize: {x: 8, y: 8},
			maximumTileSize: {x: 8, y: 8},
		};

		this.layers.push(
			new Layer_CosmoBG(bgTileCodes),
			//new Layer_CosmoActors(actors, this),
		);
	}

	getSize() {
		return {
			x: this.layers[0].tiles[0].length * this.layers[0].tileW,
			y: this.layers[0].tiles.length * this.layers[0].tileH,
		};
	}

	queryResize(proposed) {
		// Make sure the new dimensions are within the limits.
		let permitted = super.queryResize(proposed);

		// Only these widths are permitted by the game (source: ModdingWiki).
		const allowedWidths = [ 1024, 512, 256, 128, 64 ];
		for (const aw of allowedWidths) {
			if (permitted.x > aw) {
				permitted.x = aw;
				break;
			}
		}
		permitted.x = Math.max(64, permitted.x); // minimum size

		if (permitted.y === this.mapSize.y) {
			// Y hasn't changed, assume X has, so recalculate Y.
			permitted.y = COSMO_BG_LEN / permitted.x;
		} else {
			// Y changed, adjust X to fit.
			permitted.x = COSMO_BG_LEN / permitted.y;
		}
	}

	resize(newSize) {
		throw new Error('Not implemented yet!');
		// TODO: Have to resize layer0 arrays.
		super.resize(newSize); // throw if queryResize() fails
		this.mapSize = {
			x: newSize.x,
			y: newSize.y,
		};
	}

	setTilesets(ts) {
		this.layers[0].tilesetBG = ts.solid;
		this.layers[0].tilesetFG = ts.masked;
		//this.layers[1].tileset = ts.actors;
	}
}

export default class Map_Cosmo extends MapHandler
{
	static metadata() {
		let md = {
			...super.metadata(),
			id: FORMAT_ID,
			title: 'Cosmo\'s Cosmic Adventures Map Format',
			games: [
				'Cosmo\'s Cosmic Adventures',
			],
		};

		return md;
	}

	static checkLimits(map) {
		let issues = super.checkLimits(map);

		const actorCount = map.layers[1].items.length;
		if (actorCount > MAX_ACTORS) {
			issues.push(`There are too many items in the actor layer `
				+ `(${actorCount}), the maximum is ${MAX_ACTORS}.`);
		}

		let playerCount = 0, platformCount = 0, lightCount = 0;
		for (const actor of map.layers[1].items) {
			if (actor.code === 0) playerCount++;
			else if ((actor.code >= 1) && (actor.code <= 5)) platformCount++;
			else if ((actor.code >= 6) && (actor.code <= 8)) lightCount++;
		}
		if (playerCount > MAX_PLAYERS) {
			issues.push(`There are too many player sprites in the actor layer `
				+ `(${playerCount}), the maximum is ${MAX_PLAYERS}.`);
		}
		if (platformCount > MAX_PLATFORMS) {
			issues.push(`There are too many platform/mud fountain sprites in the `
				+ `actor layer (${platformCount}), the maximum is ${MAX_PLATFORMS}.`);
		}
		if (lightCount > MAX_LIGHTS) {
			issues.push(`There are too many light sprites in the actor layer `
				+ `(${lightCount}), the maximum is ${MAX_LIGHTS}.`);
		}

		return issues;
	}

	static parse({main: content}) {
		const lenContent = content.length;

		let buffer = new RecordBuffer(content);
		const header = buffer.readRecord(recordTypes.header);

		// Convert flags into attributes.
		const flags = {
			music: (header.flags >> 11) & 0x1F,
			animation: (header.flags >> 8) & 0x07,
			bgScrollY: !!(header.flags & 0x80),
			bgScrollX: !!(header.flags & 0x40),
			rain: !!(header.flags & 0x20),
			backdrop: header.flags & 0x1F,
		};


		let layerObj = 0;
		const actorCount = header.lenActorChunk / ACTOR_LEN_UINT16;
		let actors = [];
		for (let i = 0; i < actorCount; i++) {
			const actor = buffer.readRecord(recordTypes.actor);
			actors.push({
				x: actor.x,
				y: actor.y,
				code: actor.type,
			});
		}

		const mapW = header.mapWidth;
		const mapH = Math.floor(COSMO_BG_LEN / mapW);
		let tileCodes = [];
		for (let y = 0; y < mapH; y++) {
			tileCodes[y] = [];
			for (let x = 0; x < mapW; x++) {
				const code = buffer.read(RecordType.int.u16le);

				// Turn zero codes into blanks.
				if (code === 0) {
					tileCodes[y][x] = undefined;
					continue;
				}

				let tileCode = Math.floor(code / 8);
				if (tileCode > 2000) {
					let maskCode = tileCode - 2000;
					tileCode = 2000 + (maskCode / 5);
				}
				tileCodes[y][x] = tileCode;
			}
		}

		let map = new Map2D_Cosmo(tileCodes, actors);

		map.attributes['bgmusic'] = {
			title: 'Background music',
			type: 'int',
			// gameinfojs converts these numbers to filenames so we don't have to here.
			rangeMin: 0,
			rangeMax: 0x1F,
			value: flags.music,
		};

		map.attributes['animation'] = {
			title: 'Palette animation type',
			type: 'int',
			rangeMin: 0,
			rangeMax: 7,
			value: flags.animation,
		};

		map.attributes['backdrop'] = {
			title: 'Backdrop image',
			type: 'int',
			rangeMin: 0,
			rangeMax: 0x1F,
			value: flags.backdrop,
		};

		map.attributes['bgScrollX'] = {
			title: 'Scroll background horizontally',
			type: 'bool',
			value: flags.bgScrollX,
		};

		map.attributes['bgScrollY'] = {
			title: 'Scroll background vertically',
			type: 'bool',
			value: flags.bgScrollY,
		};

		map.attributes['rain'] = {
			id: 'rain',
			title: 'Rain',
			type: 'bool',
			value: flags.rain,
		};

		return map;
	}

	static generate(map) {
		const numActors = map.layers[1].items.length;

		const mapX = map.mapSize.x;
		const header = {
			flags: (
				((map.attributes['bgmusic'].value & 0x1F) << 11)
				| ((map.attributes['animation'].value & 0x07) << 8)
				| (map.attributes['bgScrollY'].value ? 0x80 : 0)
				| (map.attributes['bgScrollX'].value ? 0x40 : 0)
				| (map.attributes['rain'].value ? 0x20 : 0)
				| (map.attributes['backdrop'].value & 0x1F)
			),
			mapWidth: mapX,
			lenActorChunk: numActors * ACTOR_LEN_UINT16,
		};

		const fileSize = HEADER_LEN + header.lenActorChunk * 2 + COSMO_BG_LEN;
		let buffer = new RecordBuffer(fileSize);

		buffer.writeRecord(recordTypes.header, header);

		for (const actor of map.layers[1].items) {
			const actorData = {
				type: actor.code,
				x: actor.x,
				y: actor.y,
			}
			buffer.writeRecord(recordTypes.actor, actorData);
		}

		const tileCodes = map.layers[0].tiles;
		for (let i = 0; i < COSMO_BG_LEN; i++) {
			const y = Math.floor(i / mapX);
			const x = i % mapX;
			buffer.write(RecordType.int.u16le, tileCodes[y][x] || 0);
		}

		return {
			main: buffer.getU8(),
		};
	}
}
