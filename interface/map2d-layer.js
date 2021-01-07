/*
 * Single layer in a stack comprising of a 2D grid-based map.
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

/**
 * Interface to a single grid-based layer within a 2D stack.
 *
 * Instances of this class are returned when reading maps, and are passed
 * to the format handlers to produce new map files.
 */
export default class Map2D_Layer
{
	constructor() {
		/**
		 * Various limits of this map format.  Following these limitations ensures
		 * that the map will save successfully later.
		 */
		this.limits = {
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
		 * A friendly name for the layer.
		 *
		 * This isn't from the map metadata, this is a name for a level editor to
		 * display, for example "Foreground" or "Background".
		 */
		this.layerTitle = undefined;

		/**
		 * Two-dimensional array listing all the items in the layer grid.
		 *
		 * This is an array of rows, with each entry being an array of columns.  So
		 * access is `items[y][x]`.
		 *
		 * The dimensions are fixed at the map size returned by `Map2D`, or if that
		 * is undefined, then `this.layerSize`.  Should you resize the layer or the
		 * map, be sure to resize this array for all affected layers.
		 *
		 * Each item is an instance of {Map2D_Item}.
		 */
		this.items = [];

		/**
		 * Two-dimensional array of all possible items that can be placed in the
		 * map.  Same arrangement as `this.items`, but suitable for display to the
		 * user as a selection of available tiles.
		 */
		this.availableItems = [];
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
