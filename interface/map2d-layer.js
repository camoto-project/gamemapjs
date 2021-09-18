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
	constructor(n = {}) {
		/**
		 * Various limits of this map format.  Following these limitations ensures
		 * that the map will save successfully later.
		 */
		this.limits = {
			/**
			 * Offset in pixels of top-left corner (0,0) relative to parent map.
			 * Adjust this if the layer has a different origin point to other layers
			 * in the map.
			 */
			offsetX: n.offsetX || 0,
			offsetY: n.offsetY || 0.
		};

		/**
		 * A friendly name for the layer.
		 *
		 * This isn't from the map metadata, this is a name for a level editor to
		 * display, for example "Foreground" or "Background".
		 */
		this.title = n.title || '?';

		/**
		 * Two-dimensional array listing all the items in the layer grid.
		 *
		 * This is an array of rows, with each entry being an array of columns.  So
		 * access is `items[y][x]`.
		 *
		 * The dimensions must always match `this.width` and `this.height`.
		 *
		 * Each item is a {Number} referring to a map code.
		 */
//		this.items = [];

		/**
		 * Two-dimensional array of all possible items that can be placed in the
		 * map.  Same arrangement as `this.items`, but suitable for display to the
		 * user as a selection of available tiles.
		 */
//		this.availableItems = [];
	}

	setTilesets(tilesets) {
		this.tilesets = tilesets;
	}
}
