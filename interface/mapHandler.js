/*
 * Base class and defaults for format handlers.
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
 * Base class and defaults for archive format handlers.
 *
 * To implement a new archive file format, this is the class that will be
 * extended and its methods replaced with ones that perform the work.
 *
 * @name ArchiveHandler
 */
export default class MapHandler
{
	/**
	 * Retrieve information about the archive file format.
	 *
	 * This must be overridden by all format handlers.  It returns a structure
	 * detailed below.
	 *
	 * @return {Metadata} object.
	 */
	static metadata() {
		return {
			/**
			 * @typedef {Object} Metadata
			 *
			 * @property {string} id
			 *   A unique identifier for the format.
			 *
			 * @property {string} title
			 *   The user-friendly title for the format.
			 *
			 * @property {Array} games
			 *   A list of strings naming the games that use this format.
			 */
			id: 'unknown',
			title: 'Unknown format',
			games: [],
		};
	}

	/**
	 * Identify any problems writing the given map in the current format.
	 *
	 * @param {Map} map
	 *   Map to attempt to write in this handler's format.
	 *
	 * @return {Array} of strings listing any problems that will prevent the
	 *   supplied map from being written in this format.  An empty array
	 *   indicates no problems.
	 */
	static checkLimits(map) {
		const { limits } = this.metadata();
		let issues = [];

		// TODO: scan layers and ensure `items` matches the layer dimensions.
		if (false) {
			issues.push(`The dimensions of the layer item array do not match the map `
				+ `dimensions.  If you have resized this level, it is a bug in the `
				+ `level editor.  If not, it is a bug in the map handler.`);
		}

		return issues;
	}

	/**
	 * Get a list of supplementary files needed to use the format.
	 *
	 * Some formats store their data across multiple files, and this function
	 * will return a list of filenames needed, based on the filename and data in
	 * the main file.
	 *
	 * This allows both the filename and content to be examined, in case
	 * either of these are needed to construct the name of the supplementary
	 * files.
	 *
	 * @param {string} name
	 *   Map filename.
	 *
	 * @param {Uint8Array} content
	 *   Map content.
	 *
	 * @return {null} if there are no supplementary files, otherwise an {Object}
	 *   where each key is an identifier specific to the handler, and the value
	 *   is the expected case-insensitive filename.  Don't convert passed names
	 *   to lowercase, but any changes (e.g. appending a filename extension)
	 *   should be lowercase.
	 */
	// eslint-disable-next-line no-unused-vars
	static supps(name, content) {
		return null;
	}

	/**
	 * Read the given map file.
	 *
	 * @param {Object} content
	 *   File content of the map.  The `main` property contains the main file,
	 *   with any other supps as other properties.  Each property is a
	 *   {Uint8Array}.
	 *
	 * @return {Map} instance.
	 */
	// eslint-disable-next-line no-unused-vars
	static parse(content) {
		throw new Error('Not implemented yet.');
	}

	/**
	 * Write out an archive file in this format.
	 *
	 * @preconditions The archive has already been passed through checkLimits()
	 *   successfully. If not, the behaviour is undefined and a corrupted file
	 *   might be produced.
	 *
	 * @param {Map} map
	 *   The map to write to a file.
	 *
	 * @return {Object} containing the contents of the file in the `main`
	 *   property, with any other supp files as other properties.  Each property
	 *   is a {Uint8Array} suitable for writing directly to a file on disk or
	 *   offering for download to the user.
	 */
	// eslint-disable-next-line no-unused-vars
	static generate(map) {
		throw new Error('Not implemented yet.');
	}
}
