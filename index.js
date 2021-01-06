/*
 * Main library interface.
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

import Debug from './util/debug.js';
const debug = Debug.extend('index');

import * as formats from './formats/index.js';

export * from './formats/index.js';
export { default as Map } from './interface/map.js';
export { default as Map2D } from './interface/map2d.js';

/**
 * Get a list of all the available handlers.
 *
 * This is preferable to `import *` because most libraries also export utility
 * functions like the autodetection routine which would be included even though
 * they are not format handlers.
 */
export const all = [
	...Object.values(formats),
];
