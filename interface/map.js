/*
 * Map base class and defaults.
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
 * Base class describing the interface to a map.
 *
 * Instances of this class are returned when reading maps, and are passed
 * to the format handlers to produce new map files.
 */
export default class Map
{
	constructor() {
		/**
		 * Any metadata describing the map goes here.
		 *
		 * Each map will usually have a title, but may include other info too.
		 */
		this.metadata = {};

		/**
		 * An array of all the attributes supported by the map format in use.
		 *
		 * The format handlers add all supported attributes when a format is read,
		 * and read the current values when the map is written.  Only format
		 * handlers may modify this array, with the exception of the `selection`
		 * property on each array element, which may be modified at any time, within
		 * the constraints specified for that attribute.
		 *
		 * Each array element has the following properties:
		 *
		 *   - id: Internal code for finding IDs.  Keep it short and avoid spaces.
		 *
		 *   - title: User-friendly name for the attribute.
		 *
		 *   - type: (string) What type of values can be set.  One of:
		 *      - `preset-single`: Only one option can be set from a list.
		 *      - `preset-multiple0`: Zero or more options can be set from a list.
		 *      - `preset-multiple1`: One or more options can be set from a list.
		 *      - `string`: A free-text string can be set.
		 *      - `int`: An integer value can be set.
		 *      - `bool`: The value can be either `true` or `false`.
		 *
		 *   - presets: Array of possible values that can be set for this attribute,
		 *     for the preset-* types.  `null` or ignored otherwise.
		 *
		 *   - rangeMin: (integer) Minimum value in the range (see below).
		 *
		 *   - rangeMax: (integer) Maximum value in the range (see below).
		 *
		 *   - value: Current value.  This is the only value that can be
		 *     changed outside of the format handlers.  Its value depends on which
		 *     type of attribute this is:
		 *
		 *      - preset-single: A 0-based index into the `presets` array.
		 *
		 *      - preset-multiple*: An array of integers, each a 0-based index into
		 *        the `presets` array.
		 *
		 *      - string: A string, at least `rangeMin` characters long, but no more
		 *        than `rangeMax` characters.  Terminating nulls are not counted.
		 *        If there is no minimum, `rangeMin` will be `0`.  If there is no
		 *        maximum, `rangeMax` will be `0`.  The range values must not be
		 *        negative.
		 *
		 *      - int: A number greater than or equal to `rangeMin`, and less than
		 *        or equal to `rangeMax`.  The range values may be negative.
		 */
		this.attributes = [];

		/**
		 * Some maps have a custom palette, which will be supplied here.  This
		 * value will be one of:
		 *
		 *  - null: layer-specific palettes not supported.
		 *  - undefined: layer-specific palettes supported, but none set yet.
		 *  - gamegraphicsjs `Palette` instance: custom palette to use.
		 */
		this.palette = undefined;
	}
}
