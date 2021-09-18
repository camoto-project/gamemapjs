/*
 * Map handler for Dangerous Dave 1.
 *
 * This file format is fully documented on the ModdingWiki:
 *   http://www.shikadi.net/moddingwiki/DDave_Map_Format
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

const FORMAT_ID = 'map-ddave';

import Debug from '../util/debug.js';
const debug = Debug.extend(FORMAT_ID);

import { RecordBuffer, RecordType } from '@camoto/record-io-buffer';
import MapHandler from '../interface/mapHandler.js';
import Map2D from '../interface/map2d.js';
import Map2D_Layer_Tiled from '../interface/map2d-layer-tiled.js';
import Map2D_Layer_List from '../interface/map2d-layer-list.js';

// Size of path data (bytes).
const DD_LAYER_LEN_PATH = 256;

// Maximum number of points in the path.
const DD_MAX_PATH = 128;

//const DD_LAYER_LEN_BG = DD_MAP_WIDTH * DD_MAP_HEIGHT;
const DD_PAD_LEN = 24; // to round DD_LAYER_LEN_BG to nearest power of two

const DD_TILE_WIDTH = 16;
const DD_TILE_HEIGHT = 16;
//const DD_FILESIZE = DD_LAYER_LEN_PATH + DD_LAYER_LEN_BG + DD_PAD_LEN;

// Map code to write for locations with no tile set.
const DD_DEFAULT_BGTILE = 0;

// This is the code used in both X and Y coords to terminate a path.
const DD_PATH_END = 0xEA;

class MapLayer_DDave_BG extends Map2D_Layer_Tiled
{
	constructor(bgTiles) {
		const mapW = bgTiles[0].length;
		const mapH = bgTiles.length;
		super({
			title: 'Background',
			limits: {
				minLayerX: mapW,
				minLayerY: mapH,
				maxLayerX: mapW,
				maxLayerY: mapH,
			},
			layerW: mapW,
			layerH: mapH,
			tileW: DD_TILE_WIDTH,
			tileH: DD_TILE_HEIGHT,
			tiles: bgTiles,
		});
	}

	imageFromCode(code) {
		return this.tileset[code];
	}
}

class MapLayer_DDave_Monsters extends Map2D_Layer_List
{
	constructor(enemyInfo, tileIndex) {
		super();

		for (let i = 0; i < enemyInfo.length; i++) {
			const en = enemyInfo[i];
			if (en.enabled) {
				this.items.push({
					x: en.pixelX || 0,
					// The monster coordinates are of the lower-left so we need to offset it
					// based on the image size.
					y: (en.pixelY || 0) - 16,
					code: i,
					xAttach: 0,
					yAttach: 0,
				});
			}
		}
		this.tileIndex = tileIndex;
	}

	imageFromCode(code) {
		return this.tileset[this.tileIndex || 0];
	}
}

class Map2D_DDave extends Map2D
{
	constructor(bgTiles, enemyInfo, options) {
		super({
			viewportW: 20 * DD_TILE_WIDTH,
			viewportH: 10 * DD_TILE_HEIGHT,
			/*
			background: {
				att: Map2D.BackgroundAttachment.SingleImageTiled,
				clr: null,
				code: DD_DEFAULT_BGTILE,
				img: null,
			},
			*/
		});

		this.layers.push(new MapLayer_DDave_BG(bgTiles));

		// Add the enemy layer.
		this.layers.push(new MapLayer_DDave_Monsters(enemyInfo, options.monsterTileIndex));

		// If we were supplied with player coordinates, add a layer for those.
		if (options.playerStartX !== undefined) {
			this.layers.push(new MapLayer_DDave_Player({
				x: options.playerStartX,
				y: options.playerStartY,
			}));
		}
	}

	getSize() {
		return {
			x: this.layers[0].tiles[0].length * this.layers[0].tileW,
			y: this.layers[0].tiles.length * this.layers[0].tileH,
		};
	}

	resize() {
		throw new Error('This map format cannot be resized.');
	}

	setTilesets(ts) {
		this.layers[0].tileset = ts.background;
		this.layers[1].tileset = ts.monsters;
	}
}

export default class Map_DDave extends MapHandler
{
	static metadata() {
		let md = {
			...super.metadata(),
			id: FORMAT_ID,
			title: 'Dangerous Dave Map Format',
			games: [
				'Dangerous Dave',
			],
		};

		return md;
	}

	static checkLimits(map) {
		let issues = super.checkLimits(map);

		if (map.paths && map.paths[0]) {
			if (map.paths[0].length > DD_MAX_PATH) {
				issues.push(`The path has ${map.path[0].length} points, but the `
					+ `maximum is ${DD_MAX_PATH}.`);
			}

			let lastX = undefined, lastY = undefined;
			map.paths[0].forEach((pt, index) => {
				if (lastX !== undefined) {
					let x = pt.x - lastX;
					let y = pt.y - lastY;
					if ((x === DD_PATH_END) && (y === DD_PATH_END)) {
						issues.push(`Point #${index + 1} in the path at (${pt.x}, ${pt.y})`
							+ ` ends up at a special value reserved for indicating the end `
							+ `of the path.  Please move this point by at least one pixel in `
							+ `any direction to avoid this conflict.`);
					}
				} // else first point in path
				lastX = pt.x;
				lastY = pt.y;
			});
		}
	}

	static parse({main: content, enemy}, options = {}) {
		let mapW, mapH, hasPath;
		if (content.length === 10 * 7) {
			// Small title screen map
			mapW = 10;
			mapH = 7;
			hasPath = false;
		} else if (content.length === 1280) {
			mapW = 100;
			mapH = 10;
			hasPath = true;
		} else {
			throw new Error(`Unrecognised map size: ${content.length}.`);
		}

//		map.limits.minPathCount = 0;
//		map.limits.maxPathCount = 1;

		// Parse enemy path data.
		let offset = 0;
		if (hasPath) {
			let path = [];
			for (let i = 0; i < DD_LAYER_LEN_PATH; i += 2) {
				if ((content[i] === DD_PATH_END) && (content[i + 1] === DD_PATH_END)) {
					// No more path data
					break;
				}
				const next = {
					x: content[i],
					y: content[i + 1],
				};
				path.push(next);
			}
			//map.paths.push(path);
			offset = DD_LAYER_LEN_PATH;
		}

		// Parse background tiles.
		let bgTiles = [];
		for (let y = 0; y < mapH; y++) {
			let row = [];
			for (let x = 0; x < mapW; x++) {
				row[x] = content[offset++];
				/*
				if (row[x] === DD_DEFAULT_BGTILE) {
					row[x] = undefined;
				}
				*/
			}
			bgTiles[y] = row;
		}

		// Parse enemy data.
		let enemyList = [];
		if (enemy) {
			let enemyData = new RecordBuffer(enemy);
			for (let i = 0; i < 4; i++) {
				enemyData.seekAbs(2 * i);
				let en = {};
				en.enabled = enemyData.read(RecordType.int.u16le) !== 0;
				enemyData.seekRel(3 * 2);
				en.pixelX = enemyData.read(RecordType.int.u16le);
				enemyData.seekRel(3 * 2);
				en.pixelY = enemyData.read(RecordType.int.u16le);
				enemyData.seekRel(3 * 2);
				en.pathOffset = enemyData.read(RecordType.int.u16le);
				enemyData.seekRel(3 * 2);
				en.calmness = enemyData.read(RecordType.int.u16le);
				enemyData.seekRel(3 * 2);

				// Skip padding and go to next entry.
				enemyData.seekRel(40);

				enemyList.push(en);
			}
		}

		let map = new Map2D_DDave(bgTiles, enemyList, options);

		return map;
	}

	// todo: check to ensure all path points are within range?
	// todo: check there are fewer than 128 path points (do all paths need to end with PATH_END?)
	static generate(map) {
		let buffer = new RecordBuffer(DD_FILESIZE);

		if (map.paths && map.paths[0]) {
			let lastX = undefined, lastY = undefined;
			map.paths[0].forEach((pt, i) => {
				if (lastX !== undefined) {
					buffer[i * 2] = pt.x - lastX;
					buffer[i * 2 + 1] = pt.y - lastY;
				} // else first point in path
				lastX = pt.x;
				lastY = pt.y;
			});

			// Add the 'end of path' marker if there's enough space.
			const len = map.paths[0].length;
			if (len < DD_MAX_PATH) {
				buffer[len * 2] = DD_PATH_END;
				buffer[len * 2 + 1] = DD_PATH_END;
			} else {
				Debug.push(FORMAT_ID, 'write');
				Debug.log('TODO: Writing maximum path length and omitting terminator, will this work?');
				Debug.pop();
			}
		}

		let offset = DD_LAYER_LEN_PATH;
		for (let y = 0; y < DD_MAP_HEIGHT; y++) {
			for (let x = 0; x < DD_MAP_WIDTH; x++) {
				buffer[offset] = map.items[y][x].code || DD_DEFAULT_BGTILE;
			}
		}

		return {
			main: buffer.getU8(),
		};
	}
}
