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
		 * An object listing all the attributes supported by the map format in use.
		 *
		 * The format handlers add all supported attributes when a format is read,
		 * and read the current values when the map is written.  Only format
		 * handlers may modify this array, with the exception of the `value`
		 * property on each entry, which may be modified at any time, within the
		 * constraints specified for that attribute.
		 *
		 * The object keys are used as attribute identifier codes.  Keep them short
		 * and avoid spaces.
		 *
		 * Each entry has the following properties:
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
		 */
		this.attributes = {};

		/**
		 * Values from the `attributes` array.
		 *
		 * The properties in this object can be modified at any time, subject to the
		 * restrictions indicated for each attribute.
		 *
		 * The value of each property depends on which type of attribute it is:
		 *
		 *   - preset-single: A 0-based index into the `presets` array.
		 *
		 *   - preset-multiple*: An array of integers, each a 0-based index into
		 *     the `presets` array.
		 *
		 *   - string: A string, at least `rangeMin` characters long, but no more
		 *     than `rangeMax` characters.  Terminating nulls are not counted.
		 *     If there is no minimum, `rangeMin` will be `0`.  If there is no
		 *     maximum, `rangeMax` will be `0`.  The range values must not be
		 *     negative.
		 *
		 *   - int: A number greater than or equal to `rangeMin`, and less than
		 *     or equal to `rangeMax`.  The range values may be negative.
		 */
		this.attributeValues = {};

		/**
		 * As for `attributes` except these apply to items within the map.
		 *
		 * In this case the attribute value is stored in any
		 * `Map_Item.attributeValues` object belonging to any item in the map.
		 *
		 * The object key in `this.attributes` matches the object key in
		 * `Map_Item.attributeValues`.  If the object key does not exist in the
		 * `Map_Item` list, then that attribute is not available for that item.
		 * To include an attribute that does not have a value set but is available,
		 * set its value to `null`.
		 *
		 * The use for this is format-dependent, but it can be used for things like
		 * controlling which message is shown to the player when touching this item.
		 *
		 * Generally attributes should only be used when it is important to keep the
		 * same item image visible in a map editor, but there needs to be a way to
		 * distinguish otherwise identical items.  This works in tandem with a
		 * callback function supplied in `Map_Item.display` which can read the
		 * attributes and do something like overlay numbers on the item to aid
		 * identification.
		 *
		 * There are some standard attributes which can be handled more conveniently
		 * by map editors if they are present with the standard identifiers:
		 *
		 *  - `difficulty`: Preset list of game values.  Map editors can show the
		 *    available options in a toolbar allowing all items in the map matching
		 *    a particular difficulty level to be hidden or shown.
		 *
		 * Otherwise the attributes are specific to the map format and should be
		 * presented to the user for each map item in a generic way (if the
		 * attribute reports that it can be changed).
		 */
		this.itemAttributes = {};

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
