/*
 * Map class for 2D grid-based maps.
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

import Map from './map.js';

/// How the map background is drawn behind the level.
const BackgroundAttachment = {
	/// No background image, display as transparent.
	NoBackground: 0,

	/// Display `img` centered in the middle of the viewport.
	SingleImageCentred: 1,

	/// Display `img` repeated to fill the largest map layer.
	SingleImageTiled: 2,

	/// Background is the solid colour `clr`.
	SingleColour: 3,
};

/**
 * Class describing the interface to a grid-based map.
 *
 * Instances of this class are returned when reading maps, and are passed
 * to the format handlers to produce new map files.
 */
export default class Map2D extends Map
{
	constructor(n = {}) {
		super(n);

		this.type = 'map2d';

		/**
		 * Size of the in-game viewport, in pixels.
		 *
		 * These dimensions indicate how much of the level can be seen by the player
		 * inside the game.  Given the age of most DOS games, it is typically how
		 * many tiles can be seen on a 320x200 display (minus the space used for the
		 * status bar).
		 *
		 * The default is very obviously much too small to make obvious to
		 * developers when specifying the viewport has been forgotten.
		 */
		this.viewportW = n.viewportW || 16;
		this.viewportH = n.viewportH || 16;

		/**
		 * How the level background should appear.  If the background can be
		 * changed, it will be made available as a metadata item.
		 */
		this.background = n.background || {
			att: BackgroundAttachment.NoBackground,
			clr: null,  // Palette index as Number
			code: null, // map item
			img: null,  // GameGraphics.Image
		};

		/**
		 * Size of all the layers, in number of tiles.
		 *
		 * `undefined` means the map size is set by the layers and should not be
		 * changed here.  If this value is set, it will be an object with `x` and
		 * `y` members and can be modified within the limits indicated by
		 * `this.limits.minimumMapSize` and `this.limits.maximumMapSize`.
		 */
//		this.mapSize = undefined;

		/**
		 * An array of all the layers in the map.
		 *
		 * Each element in the array is a `Map2D_Layer` object.
		 */
		this.layers = [];
	}

	/**
	 * Get the dimensions of the whole map, in pixels.
	 *
	 * This can be used for a bounding box or canvas size that will contain the
	 * entire level.
	 */
	getSize() {
		return {
			x: undefined,
			y: undefined,
		};
	}

	/**
	 * See if the proposed size can be accommodated by the map.
	 *
	 * The default implementation just ensures the values are within the minimum
	 * and maximum permitted.
	 *
	 * The function can be overridden for formats with unusual requirements, such
	 * as Cosmo where the number of tiles in the level is fixed, so as one
	 * dimension increases, the other must decrease.  Overridden functions should
	 * still call this parent implementation to handle the size limits.
	 *
	 * @param {object} proposed
	 *   Object with `.x` and `.y` properties containing the intended new size.
	 *
	 * @return {object} in same format as `proposed` but with the properties
	 *   adjusted.
	 */
	queryResize(proposed) {
		let permitted = {...proposed};

		permitted.x = Math.min(permitted.x, this.limits.maximumMapSize.x);
		permitted.x = Math.max(permitted.x, this.limits.minimumMapSize.x);
		permitted.y = Math.min(permitted.y, this.limits.maximumMapSize.y);
		permitted.y = Math.max(permitted.y, this.limits.minimumMapSize.y);
	}

	/**
	 * Resize the map.
	 *
	 * The default implementation calls `queryResize()` and throws an exception
	 * if the returned value does not match the proposed value, implying that the
	 * caller tried to set a new size without running it through `queryResize()`
	 * first.
	 *
	 * Implementations should override this to perform the actual resize, although
	 * still call this function first to enforce the `queryResize()` requirement.
	 *
	 * @param {object} newSize
	 *   Object with `.x` and `.y` properties containing the intended new size.
	 *
	 * @return No return value but may throw an exception.
	 */
	resize(newSize) {
		const permitted = this.queryResize(newSize);
		if ((permitted.x !== newSize.x) || (permitted.y !== newSize.y)) {
			throw new Error('Requested map size is invalid.');
		}
	}
}

Map2D.BackgroundAttachment = BackgroundAttachment;
