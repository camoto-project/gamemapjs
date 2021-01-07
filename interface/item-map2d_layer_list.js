/*
 * Map element contained within a layer in a 2D map.
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

import Item from './item.js';

export default class Item_Map2D_Layer_List extends Item
{
	constructor() {
		super();

		// Add coordinates and dimensions to the item.
		this.x = undefined;
		this.y = undefined;
		this.width = undefined;
		this.height = undefined;
	}
}
