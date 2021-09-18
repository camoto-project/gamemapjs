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
	constructor(n = {}) {
		super(n);

		this.type = '2d.tiled';

		const nl = (n && n.limits) || {};
		this.limits = {
			...this.limits,

			/**
			 * Smallest size for this layer.
			 * For maps that cannot be resized, the min and max values will be the
			 * same.
			 */
			minLayerW: nl.minLayerW || 1,
			minLayerH: nl.minLayerH || 1,

			/**
			 * Largest possible map size.  Undefined means no limit.
			 */
			maxLayerW: nl.maxLayerW || undefined,
			maxLayerH: nl.maxLayerH || undefined,

			/**
			 * Smallest size of each individual tile/grid.  For maps that cannot have
			 * the tile size changed, the min and max values will be the same.
			 */
			minTileW: nl.minTileW || 1,
			minTileH: nl.minTileH || 1,

			/**
			 * Largest size of each individual tile/grid.  Undefined means no limit.
			 */
			maxTileW: nl.maxTileW || undefined,
			maxTileH: nl.maxTileH || undefined,
		};

		/**
		 * Size of the grid tiles in the layers, in pixels.
		 *
		 * `undefined` means the grid size is set globally and should not be
		 * changed here.  If this value is set, it will be an Object with `x` and
		 * `y` members and can be modified within the limits indicated by
		 * `this.limits.minimumTileSize` and `this.limits.maximumTileSize`.
		 *
		 * After modifying call checkLimits() on the map handler to confirm the new
		 * limits are valid (e.g. Cosmo has a fixed number of tiles, so enlarging
		 * one dimension requires the other to be shrunk.)
		 *
		 * Typically this will be something like 8x8 or 16x16.
		 */
		this.tileW = n.tileW;
		this.tileH = n.tileH

		/**
		 * Size of the layer, in number of tiles.
		 *
		 * The size can always be changed within the limits above.  If the format
		 * does not support having the size changed then the limits will only permit
		 * one set of dimensions.
		 *
		 * TODO: how to indicate that the map has multiple layers that must be the
		 * same size.
		 */
		this.layerW = n.layerW;
		this.layerH = n.layerH;

		/**
		 * Two-dimensional array of tiles.
		 *
		 * Each value is an opaque tile code (could be a number, and object, or
		 * something else depending on what works best for the map handler).
		 */
		this.tiles = n.tiles || [];
	}

	/**
	 * Convert a map code into an imagelist index.
	 *
	 * @param {object} code
	 *   Map code supplied by the format handler.
	 *
	 * @param {Array<Image>} tileset
	 *   An array of images in the current tileset.  Typically one of these will
	 *   be returned in the `img` property.
	 *
	 * @return {Object} with the below properties.
	 */
	// eslint-disable-next-line no-unused-vars
	imageFromCode(code, tileset) {
		return {
			/**
			 * Overlay a hex number on the tile.
			 *
			 * null: show no digits
			 * 0x10..0x1F = 0..F,
			 * 0x100-0x1FF = 00..FF,
			 * 0x10000-0x1FFFF = 0000..FFFF
			 */
			digit: null,

			/**
			 * Image to show from the `tileset` array, or null to show no image.  In
			 * this case one of the other values must be set as an entirely invisible
			 * object is undesirable for the user experience.
			 *
			 * If non-null, it is an array of objects which will be drawn on top of
			 * each other (so overlays can be achieved) with the first array element
			 * drawn first.  Each array element has these properties:
			 *
			 *  - `image` - actual picture to display, from an entry in `tileset`.
			 *  - `offsetX` - number of pixels to shift image, left if negative.
			 *  - `offsetY` - number of pixels to shift image, up if negative.
			 */
			compositeImage: null,

			/**
			 * Overlay some small icons to suggest movement in one or more directions.
			 */
			arrow: {
				left: false,
				right: false,
				up: false,
				down: false,
			},
		};
	}

	/**
	 * Is the given tile permitted at the specified location?
	 *
	 * This function is called for each coordinate as the user moves the cursor
	 * around, so avoid slow checks.
	 *
	 * If an item is only permitted a limited number of times in the level, set
	 * this limit on the item itself so it need only be checked once when the
	 * user first selects it.
	 *
	 * @param {Number} x
	 *   Proposed X coordinate, in tiles.
	 *
	 * @param {Number} y
	 *   Proposed Y coordinate, in tiles.
	 *
	 * @param {Map2D_Item} item
	 *   Code from this.items.
	 *
	 * @return Object with `.valid` set to `true` if the tile is permitted, or
	 *   `false` if not.
	 */
	// eslint-disable-next-line no-unused-vars
	isPermittedAt(x, y, item) {
		return {
			valid: false,
			reason: 'The isPermittedAt() function has not been implemented by the '
				+ 'map layer.',
		};
	}
}
