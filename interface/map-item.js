/*
 * Map object/item contained within a map.
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
 * The item's location is not specified here and is located at the point where
 * this item is added to a map.  This allows the same items to be used for 2D
 * and 3D maps.
 */
export default class Map_Item
{
	constructor() {
		/**
		 * An array of points representing all the paths in the map.
		 *
		 * Paths are used for things like giving actors a track to follow, or to
		 * indicate where a player warp point will end up.
		 *
		 * Each element in the array is an object containing the same sort of
		 * coordinates used to locate this Map_Item.  Typically this will be `x`
		 * and `y` properties.
		 *
		 * This is `null` (as opposed to an empty array) if this item does not
		 * support paths.
		 */
		this.path = null;

		/* This belongs in the tile info instead 
		this.blocking = { 
			blockLeft:   false, ///< Prevent movement right, through the left edge
			blockRight:  false, ///< Prevent movement left, through the right edge
			blockTop:    false, ///< Prevent movement down through the top edge (can stand on)
			blockBottom: false, ///< Prevent movement up through the bottom edge
			jumpDown:    false, ///< Can down-jump to fall through
			slant45:     false, ///< Slanted tile /, 45 degrees CCW from the horizontal
			slant135:    false, ///< Slanted tile \, 135 degrees CCW from the horizontal
		};
		*/

		/**
		 * If non-null, a text string is associated with this item.
		 */
		this.text = null;
		this.textMaxLength = 0;
		this.textMinLength = 0;
	}
}
