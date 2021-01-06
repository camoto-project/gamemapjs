/*
 * Layer of fixed-size tiles in a grid arrangement.
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

import Map2D_Layer from './map2d-layer.js';

/**
 * Interface to a single grid-based layer within a 2D stack.
 *
 * Instances of this class are returned when reading maps, and are passed
 * to the format handlers to produce new map files.
 */
export default class Map2D_Layer_Tiled extends Map2D_Layer
{
	constructor() {
		super();

		this.limits = {
			...this.limits,

			/**
			 * Smallest map size.  Only used when all layers inherit this size.
			 * For maps that cannot be resized, the min and max values will be the
			 * same.
			 */
			minimumLayerSize: {x: 0, y: 0},

			/**
			 * Largest possible map size.  Undefined means no limit.
			 */
			maximumLayerSize: {x: undefined, y: undefined},

			/**
			 * Smallest size of each individual tile/grid.  Only used when all layers
			 * inherit this size.  For maps that cannot have the tile size changed,
			 * the min and max values will be the same.
			 */
			minimumTileSize: {x: 1, y: 1},

			/**
			 * Smallest size of each individual tile/grid.  Undefined means no limit.
			 */
			maximumTileSize: {x: undefined, y: undefined},
		};

		/**
		 * Size of the layer, in number of tiles.
		 *
		 * `undefined` means the map size is set globally and should not be
		 * changed here.  If this value is set, it will be an Object with `x` and
		 * `y` members and can be modified within the limits indicated by
		 * `this.limits.minimumLayerSize` and `this.limits.maximumLayerSize`.
		 */
		this.layerSize = undefined;

		/**
		 * Size of the grid tiles in the layers, in pixels.
		 *
		 * `undefined` means the grid size is set globally and should not be
		 * changed here.  If this value is set, it will be an Object with `x` and
		 * `y` members and can be modified within the limits indicated by
		 * `this.limits.minimumTileSize` and `this.limits.maximumTileSize`.
		 *
		 * Typically this will be something like 8x8 or 16x16.
		 */
		this.tileSize = undefined;

		/**
		 * Two-dimensional array of tiles.
		 *
		 * Each value is an opaque tile code (could be a number, and object, or
		 * something else depending on what works best for the map handler).
		 */
		this.tiles = [];
	}
}
