/*
 * Layer comprised of a list of variable-sized objects at arbitrary positions.
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
export default class Map2D_Layer_List extends Map2D_Layer
{
	constructor() {
		super();

		this.type = '2d.list';

		this.limits = {
			...this.limits,

			/**
			 * Limits for item coordinates in this layer.
			 * All items must be >= minX/Y and <= maxX/Y.
			 */
			minX: 0,
			minY: 0,
			maxX: undefined,
			maxY: undefined,
		};

		/**
		 * Array of item in the layer.  Each item has the following properties:
		 *
		 *  - `x` and `y`: Coordinates in pixels from upper left (0,0).
		 *  - `code`: Opaque object code that represents this object.  Used for
		 *    working out which image to display.  Could be a number, object, or
		 *    something else as it is entirely up to the map format handler.  It
		 *    should implement a `toString()` method debug messages.
		 */
		this.items = [];
	}
}
