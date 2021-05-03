/*
 * Command line interface to the library.
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

import Debug from '../util/debug.js';
const g_debug = Debug.extend('cli');

import fs from 'fs';
import commandLineArgs from 'command-line-args';
import {
	all as gamemapFormats,
	Map2D,
	Map2D_Layer_Tiled,
	Map2D_Layer_List,
} from '../index.js';

class OperationsError extends Error {
}

class Operations
{
	constructor() {
	}

	info() {
		const p = process.stdout.write.bind(process.stdout);
		p(`Map class: ${this.map.constructor.name}\n`);

		p(`Common properties:\n`);
		p(' * Attributes:\n');
		for (const a of this.map.attributes) {
			p(`    - ${a.id}=${a.value}`);
			switch (a.type) {
				case 'int': p(` [min=${a.rangeMin} max=${a.rangeMax}]`); break;
				case 'bool': p(` [true/false]`); break;
				default: p(` [unknown type "${a.type}"]`); break;
			}
			p(`  # ${a.title}\n`);
		}

		if (this.map instanceof Map2D) {
			p(`Map type: 2D layered\n`);
			p(` * Number of layers: ${this.map.layers.length} (`);
			p(Object.keys(this.map.layers).join(', ') + ')\n');
		} else {
			p(`Map type: Unknown\n`);
		}
	}

	open(params) {
		if (!params.format) {
			throw new OperationsError('open: must specify file format with -t.');
		}
		if (!params.target) {
			throw new OperationsError('open: missing filename.');
		}

		const handler = gamemapFormats.find(h => h.metadata().id === params.format);
		if (!handler) {
			throw new OperationsError(`Invalid format code: ${params.format}.`);
		}

		let content = {
			main: fs.readFileSync(params.target),
		};

		const suppList = handler.supps(params.target, content.main);
		if (suppList) {
			for (const [id, suppFilename] of Object.entries(suppList)) {
				try {
					content[id] = fs.readFileSync(suppFilename);
					content[id].filename = suppFilename;
				} catch (e) {
					throw new OperationsError(`open: unable to open supplementary file `
						+ `"${suppFilename}": ${e.message}`);
				}
			}
		}

		this.map = handler.parse(content);
		this.handler = handler;
	}

	async save(params) {
		if (!params.target) {
			throw new OperationsError('save: missing filename');
		}

		const problems = this.handler.checkLimits(this.map);
		if (problems.length) {
			console.log('There are problems preventing the requested changes from taking place:\n');
			for (let i = 0; i < problems.length; i++) {
				console.log((i + 1).toString().padStart(2) + ': ' + problems[i]);
			}
			console.log('\nPlease correct these issues and try again.\n');
			throw new OperationsError('save: cannot save due to file format limitations.');
		}

		console.warn('Saving to', params.target);
		const outContent = this.handler.generate(this.map);

		let promises = [];
		const suppList = this.handler.supps(params.target, outContent.main);
		if (suppList) {
			for (const [id, suppFilename] of Object.entries(suppList)) {
				console.warn(` - Saving supplemental file "${id}" to ${suppFilename}`);
				promises.push(
					fs.promises.writeFile(suppFilename, outContent[id])
				);
			}
		}
		promises.push(fs.promises.writeFile(params.target, outContent.main));

		return await Promise.all(promises);
	}

	text(params) {
		const p = process.stdout.write.bind(process.stdout);

		if (!params.layer) {
			throw new OperationsError('text: missing layer index.');
		}

		const layer = this.map.layers[params.layer];
		if (!layer) {
			throw new OperationsError(`text: layer ${params.layer} does not exist.`);
		}
		if (layer instanceof Map2D_Layer_Tiled) {
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			const size = this.map.size();
			let codeMap = [], lastCode = 0;
			for (let y = 0; y < size.y; y++) {
				for (let x = 0; x < size.x; x++) {
					const code = layer.tiles[y][x];
					if (code === null) {
						p(' ');
					} else if (code === undefined) {
						p('?');
					} else {
						const codeString = code.toString();
						if (!codeMap[codeString]) {
							codeMap[codeString] = chars[lastCode++];
							lastCode %= chars.length;
						}
						p(codeMap[codeString]);
					}
				}
				p('\n');
			}
		} else if (layer instanceof Map2D_Layer_List) {
			for (const item of layer.items) {
				p(`(${item.x},${item.y}) - ${item.code}\n`);
			}
		} else {
			throw new OperationsError(`text: displaying layer type `
				+ `"${layer.constructor.name}" has not been implemented yet.`);
		}
	}
}

Operations.names = {
	info: [],
	open: [
		{ name: 'format', alias: 't' },
		{ name: 'target', defaultOption: true },
	],
	save: [
		{ name: 'target', defaultOption: true },
	],
	text: [
		{ name: 'layer', defaultOption: true },
	],
};

// Make some alises
const aliases = {
	info: ['dump'],
};
Object.keys(aliases).forEach(cmd => {
	aliases[cmd].forEach(alias => {
		Operations.names[alias] = Operations.names[cmd];
		Operations.prototype[alias] = Operations.prototype[cmd];
	});
});

function listFormats()
{
	for (const handler of gamemapFormats) {
		const md = handler.metadata();
		console.log(`${md.id}: ${md.title}`);
		if (md.params) Object.keys(md.params).forEach(p => {
			console.log(`  * ${p}: ${md.params[p]}`);
		});
	}
}

async function processCommands()
{
	let cmdDefinitions = [
		{ name: 'help', type: Boolean },
		{ name: 'formats', type: Boolean },
		{ name: 'name', defaultOption: true },
	];
	let argv = process.argv;

	let cmd = commandLineArgs(cmdDefinitions, { argv, stopAtFirstUnknown: true });
	argv = cmd._unknown || [];

	if (cmd.formats) {
		listFormats();
		return;
	}

	if (!cmd.name || cmd.help) {
		// No params, show help.
		console.log(`Use: gamemap --formats | [command1 [command2...]]

Options:

  --formats
    List all available file formats.

Commands:

  info | dump
    Display information about the opened map.

  open -t <format> <file>
    Open the local <file> as a map in format <format>.

  save <file>
    Save the current map with any modifications to a new file, in its original
    file format.

  text <layer>
    Display layer number <layer> as text on stdout.  Output type varies
    depending on the type of map layer.

Examples:

  gamemap open -t map-cosmo a1.mni info

  # The DEBUG environment variable can be used for troubleshooting.
  DEBUG='gamemap:*' gamemap ...
`);
		return;
	}

	let proc = new Operations();
	//	while (argv.length > 2) {
	while (cmd.name) {
		const def = Operations.names[cmd.name];
		if (def) {
			const runOptions = commandLineArgs(def, { argv, stopAtFirstUnknown: true });
			argv = runOptions._unknown || [];
			try {
				await proc[cmd.name](runOptions);
			} catch (e) {
				if (e instanceof OperationsError) {
					console.error(e.message);
					process.exit(2);
				}
				throw e;
			}
		} else {
			console.error(`Unknown command: ${cmd.name}`);
			process.exit(1);
		}
		cmd = commandLineArgs(cmdDefinitions, { argv, stopAtFirstUnknown: true });
		argv = cmd._unknown || [];
	}
}

export default processCommands;
