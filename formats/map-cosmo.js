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

// Number of tiles in the background layer.
const COSMO_BG_LEN = 32764;

// Width limits of BG layer.  Minimums are one screen/viewport in size.
const COSMO_BG_MIN_X = 38;
const COSMO_BG_MIN_Y = 18;
const COSMO_BG_MAX_X = COSMO_BG_LEN / COSMO_BG_MIN_Y;
const COSMO_BG_MAX_Y = COSMO_BG_LEN / COSMO_BG_MIN_X;

class Layer_CosmoBG extends Map2D_Layer_Tiled
{
	constructor(tileCodes, map) {
		super();

		for (let i = 0; i < tileCodes.length; i++) {
			const x = i % map.mapSize.x;
			const y = (i / map.mapSize.x) >>> 0;
			if (!this.tiles[y]) this.tiles[y] = [];

			// Turn zero codes into blanks.
			if (tileCodes[i] === 0) {
				tileCodes[i] = null;
			}

			this.tiles[y][x] = tileCodes[i];
		}
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
}

class Layer_CosmoActors extends Map2D_Layer_List
{
	constructor(actors) {
		super();

		this.items = actors;
	}
}

class Map2D_Cosmo extends Map2D
{
	constructor(bgTileCodes, actors, mapWidth) {
		super();

		this.limits = {
			...this.limits,
			minimumTileSize: {x: 8, y: 8},
			maximumTileSize: {x: 8, y: 8},
		};

		this.mapSize = {
			x: mapWidth,
			y: Math.floor(COSMO_BG_LEN / mapWidth),
		};

		this.layers.push(
			new Layer_CosmoBG(bgTileCodes, this),
			new Layer_CosmoActors(actors, this),
		);
	}

	queryResize(proposed) {
		// Make sure the new dimensions are within the limits.
		let permitted = super.queryResize(proposed);

		if (permitted.y === this.mapSize.y) {
			// Y hasn't changed, assume X has, so recalculate Y.
			permitted.y = COSMO_BG_LEN / permitted.x;
		} else {
			// Y changed, adjust X to fit.
			permitted.x = COSMO_BG_LEN / permitted.y;
		}
	}

	resize(newSize) {
		super.resize(newSize); // throw if queryResize() fails
		this.mapSize = {
			x: newSize.x,
			y: newSize.y,
		};
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

		let tileCodes = [];
		for (let i = 0; i < COSMO_BG_LEN; i++) {
			const tileCode = buffer.read(RecordType.int.u16le);
			tileCodes.push(tileCode);
		}

		let map = new Map2D_Cosmo(tileCodes, actors, header.mapWidth);

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
