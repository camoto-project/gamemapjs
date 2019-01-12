# gamemap.js
Copyright 2018-2019 Adam Nielsen <<malvineous@shikadi.net>>  

This is a Javascript library that can read and write the playable levels in
some MS-DOS games from the 1990s.  The levels are returned in a generic form,
so that code using this library will work with all supported games in the same
way.

## Installation as an end-user

If you wish to use the command-line `gamemap` utility to work with the
algorithms directly, you can install the library globally on your system:

    npm install -g @malvineous/gamemap

### Command line interface

The `gamemap` utility can be used to inspect game levels.  Use the `--help`
option to get a list of all the available options.  Some quick examples:

    # List supported file formats
    gamemap --formats

## Installation as a dependency

If you wish to make use of the library in your own project, install it
in the usual way:

    npm install @malvineous/gamemap

See `cli/index.js` for example use.  The quick start is:

    const GameMap = require('@malvineous/gamemap');
    
    // Read a game level
    const mapHandler = GameCompression.getHandler('map-cosmo');
    const content = {
        main: fs.readFileSync('a1.mni'),
    };
    let map = mapHandler.read(content);
    
    // Save the level to a new file
    const output = mapHandler.write(map);
    fs.writeFileSync('a1.new', output.main);

## Installation as a contributor

If you would like to help add more file formats to the library, great!
Clone the repo, and to get started:

    npm install --dev

Run the tests to make sure everything worked:

    npm test

You're ready to go!  To add a new format:

 1. Create a new file in the `map/` subfolder for the format.

 2. Edit the main `index.js` and add a `require()` statement for your new file.

 3. Make a folder in `test/` for your new algorithm and populate it with
    files similar to the others.  The tests work by passing standard data to
    each handler and comparing the result to what is inside this folder.
    
    You can either create these files by hand, with another utility, or if you
    are confident that your code is correct, from the code itself.  This is done
    by setting an environment variable when running the tests, which will cause
    the data produced by your code to be saved to a temporary file in the
    current directory:
    
        SAVE_FAILED_TEST=1 npm test
        mv error1.bin test/map-myformat/default.bin

If you use `Debug.log` rather than `console.log` then these messages can be left
in for future diagnosis as they will only appear when `--debug` is given.

### Development tips

#### Levels inside .exe files

If a game's levels are stored inside the main .exe file, or another file that
contains other data, there are two ways this can be handled.  Remember that none
of the libraries modify files in-place, they only read them into memory in full,
and write new files from the data stored in memory.

The first method is to have the map handler read the whole file, and store the
extra unused .exe data so that it can be written out again in full when the maps
are saved.  This method is simple but it cannot be used unless the only moddable
data contained in the file is map data.  If it contains other data that can be
modified, such as game graphics, then there is a problem.

Imagine an .exe file with both maps and graphics.  The file is loaded by
gamemapjs which decodes the game levels and stores the rest of the data for
later.  Then gamegraphicsjs loads the same file, decodes the images, and also
stores the rest of the data for later.  If both modified graphics and maps are
then saved, what happens?  When the maps are saved the extra .exe data will be
written, including the original graphics.  When the graphics are saved, the
extra .exe data written includes the original maps.  So whichever one gets saved
first will have its changes lost.

So whenever a file contains multiple types of data, the second option must be
used.  This is to add it to gamearchivejs as if it were an archive file.  In the
example above, the map and graphics data would appear as separate files within
the .exe "archive".  This allows the maps to be loaded from the map files inside
the archive, the graphics loaded from the graphics files, and whenever any of
them are saved, the archive handler takes care of combining all the data back
into the complete .exe file.
