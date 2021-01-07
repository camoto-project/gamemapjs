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
 * and 3D maps by inheriting from this class.
 */
export default class Item
{
	constructor() {
		/**
		 * An array of points representing all the paths in the map.
		 *
		 * Paths are used for things like giving actors a track to follow, or to
		 * indicate where a player warp point will end up.
		 *
		 * Each element in the array is an object containing the same sort of
		 * coordinates used to locate this `Item`.  Typically this will be `x`
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
		 * Values for attributes that apply to this item.
		 *
		 * The attributes themselves are listed in `Map.itemAttributes`, with only
		 * the values stored here, matched up by the object key.
		 */
		this.attributeValues = {};

		/**
		 * How to display this item.
		 *
		 * Can be one of:
		 *
		 *  - `null` to display nothing at all (not recommended!)
		 *  - array of display objects.
		 *  - function that returns one of the above values.  The function will be
		 *    called to obtain display instructions when the map is first loaded,
		 *    and again if this item's attributes are changed by the user.
		 *
		 * Each display object is one of:
		 *
		 *   {i: 0} - display the first image in the map layer's imagelist.
		 *   {text: 'ABC', font: 1} - display text (see below).
		 *   {icon: Item.Icons.LeftArrow} - display an icon.
		 *
		 * Each display object can contain the following optional properties:
		 *
		 *   `x` - offset the visual element horizontally in pixels, negative moves left.
		 *   `y` - offset the visual element vertically in pixels, negative moves up.
		 *
		 * In the text string, $0 switches to the initial/default colour, $1 is a
		 * secondary colour, and so on.  "$$" is used for a single dollar sign, so
		 * remember to escape strings if they are coming from game or user text.
		 * The optional `font` property can be set to `1` to use a font supplied by
		 * the game for rendering the text.  Typically this is only used for those
		 * games like Xargon that display text in the level itself.
		 *
		 * These can be combined and overlaid on top of one another, as shown by
		 * some examples:
		 *
		 *   // Draw the 7th image then draw the 16th over the top
		 *   [
		 *     {i: 6},
		 *     {i: 15},
		 *   ]
		 *
		 *   // Draw the third image but moved up 5 pixels
		 *   [ {i: 2, y: -5} ]
		 *
		 *   // Draw #0, then #1 offset by (2,3) pixels
		 *   [
		 *     {i: 0},
		 *     {i: 1, x: 2, y: 3}
		 *   ]
		 *
		 *   // Draw no image just "FF" in the default font
		 *   [ {text: 'FF'} ]
		 *
		 *   // Draw "A00" with "00" in the secondary colour
		 *   [ {text: 'A$100'} ]
		 *
		 *   // Draw "Hi" in the game's first font
		 *   [ {font: 1, text: 'Hi'} ]
		 *
		 *   // Draw two images overlaid with the text "X$".
		 *   [
		 *     {i: 3},
		 *     {i: 73, y: 4},
		 *     {text: 'X$$', x: 3, y: -4},
		 *   ]
		 */
		this.display = null;

		/**
		 * An arbitray number used to group the behaviour of certain items together.
		 *
		 * This is used for associating switches with platforms, and doors/teleporters
		 * with their destinations.
		 *
		 * Note that there is no way to specify a source or destination, everything
		 * simply belongs to the same group.  In the case of one-way doors for
		 * example, two different `Item` instances will have to be used (one for
		 * the source and one for the destination).
		 *
		 * Use `null` if this item cannot be added to a group, `0` if the item can be
		 * in a group but is currently not, and any other number for the item to
		 * belong to that group number.  The numbers are arbitrary and do not matter,
		 * so long as all items in the group have the same value.
		 */
		this.idGroup = null;

		this.options = {
			idSource: false,
			idTarget: false,
		};

		// Arbitrary integer used to identify this as the source of a link.  Used for
		// switches, and doorway/teleporter entrances.  `null` if not used, otherwise
		// any integer value.
		this.idSource = null;

		// Arbitrary integer used to link this back to another item's `idSource`.
		// Used for switched platforms and doorway/teleporter exits.
		this.idTarget = null;
	}
}

/**
 * Icons for overlaying on top of items in `Item.display`.
 */
Item.Icons = {
	Error: 0,
	Warning: 1,
	UpArrow: 2,
	DownArrow: 3,
	LeftArrow: 4,
	RightArrow: 5,
	UpDownArrow: 6,
	LeftRightArrow: 7,
	UpDownLeftRightArrow: 8,
	UpLeftDiagArrow: 9,
	DownLeftDiagArrow: 10,
	UpRightDiagArrow: 11,
	DownRightDiagArrow: 12,
};
