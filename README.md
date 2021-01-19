# Open Battle Map

## Project Status

**This software is barely Alpha now ... expect breaking changes everywhere!**

## What is Open Battle Map?

Open Battle Map is a small Web Service, which helps you to play role playing games,
tactical board games etc. remotely with your friends (Corvid-19 ...). It should
basically work with everything, where you move figures or tokens or whatever over
some kind of map or game board.

There are a few things it does not do:

### It does NOT help you to create maps or game boards

Depending what you want to do, there are many ways to get a suitable map or game
board into this tool. Here some ideas:

 * Outdoor maps for role playing: Use the "satellite view" button in Google Maps.
 * Indoor maps: Check for the level maps you find in the walkthroughs of
   computer games with a suitable setting. 
 * A board game you actually physically own: Just take a photo of the board(s)
   with your cell phone or use a scanner.
 * Draw something manually and scan it.
 * Use image tools like Inkscape etc to create your own game maps. If you
   use vector graphics (e.g. SVG) the zoom works best.
 
### It does not care about security

This tool will protect your privacy only by using hard to guess link names.
If that is not enough for you, you need to run the application behind some
web server with basic auth, TLS etc. Otherwise anyone with a link to a map set
can use your server.

### It is unsuitable for games with limited information

The whole point of this tool is share information (a map or game board) between
some players. It tries nothing to hide. If you want to play games in which
players have limited insight what is going on like poker, you need something
completely different. 

## How to run?

The preferred way to run a Open Battle Map is as a docker container. To create
a docker image do this:

 * Before you start working, make sure you have:
   * Linux (Is that a problem? ... https://dilbert.com/strip/1995-06-24)
   * A reasonable up-to-date npm/NodeJS (the Debian 10 (Buster) NodeJS is too old...).
   * Typescript
   * Docker 
 * To build the image do this:
   * Git-clone the repository.
   * In the `obm_react` folder run: `npm install`
   * Consider setting the environment variable OBM_SSH_KEY to a suitable SSH public key file.
     This key will allow you to access your container e.g. to retrieve the Admin Secret.
     You don't need it for local deployments where you can do `docker exec -it open_battle_map /bin/bash`
     instead. But on e.g. AWS you will need it. If you don't either `~/.ssh/id_rsa.pub` will
     be used, or the next step will fail.
   * In the `deploy` folder run: `./prepare_build.sh`
 * Now you have a few options:
   * To run the image locally just start `./run_image_local.sh`. The service will be started be
     available on `http://localhost`. The Admin Secret will be written to the console on start.
     This is most likely not too useful because your friends will not be able to reach the
     service. However, it helps to test and also the scripts should you give a hint how to run the
     image on your preferred Docker host.
   * Deploy the docker image instead to your preferred Docker Host. If you want to use
     Amazon (AWS) have a look at:
     
     * https://github.com/HaraldWilhelmi/open_battle_map_cdk
    
The procedure to set up the application manually on a Linux VM without Docker
should pretty clear. Just look at `deploy/docker/Dockerfile` and
`deploy/docker/bootstrap.sh` to get an idea what needs to be done. Most of the
stuff is actually about TLS. So, if you don't need HTTPS, or you have already
a load balancer or reverse proxy in place, which takes are care of that, the
setup will be almost trivial.
 
## Features

### Basic Usage

 * Use *Upload Background* in the *Work* tab to upload your battle map.
 * Set scale of your map - pixels per meter in your background map. For Yankees:
   For game purpose meters and yards are the same...
 * Click on tokens in the Token Box in the Play tab or on the map to pick them up.
 * Click twice to place (1) a token and to adjust where it is facing (2). 
 * New tokens are automatically numbered.
 * Click on one of the colored laser pointers to show your friends something
   on the map. Then try to order the laser diode in China, which you need to
   build a real life version of the black one.
 * Use the mouse wheel (two-finger spread/contraction on many node books)
   to zoom in/out on the present mouse position.
 * Grab the map (hold left mouse button) to move it.

### Hot Keys

 * **m**: Enter measurement mode. Click on the map and move the mouse show
   distances and map coordinates. Click again to exit. Also displays the
   Gurps range modifier (assuming that 1 m = 1 yd - good enough for game
   purpose I guess).
 * **w / a / s / d**: Moves the map.
 * **e / q**: Zoomes in/out on the map.
 * **Escape**: Leave measurement or pointer mode.

## FAQ

### Can I import images to have custom tokens?

Yes, but it is not really comfortable:

 * Export the map set
 * Unpack the .obm file with tar or WinZip (it is a tar.gz)
 * Include a SVG symbol in tokens.xhtml for your token.
   * Use the same CSS styles as the ones used for the other tokens. You can
    not define your own styles in the file because they are not used
    on the server. They are only included here for easier testing.
   * Use the next free ID for your token in the format *token\<token type\>*,
    e.g. 'token7'.
 * Add the necessary data for your token in tokens.json.
 * Pack everything together in a new .obm file.
 * Import that file to a new Map Set so that you can throw away the whole
   Map Set if things went awfully bad.
   
### Why are custom tokens are so complicated?

There seem to be strange limitations and/or bugs when trying to combine CSS transformations
with HTML area maps, and the `img` tag. The best workaround was to directly embed
an SVG into the DOM of the final web page and use SVG symbols from it for the actual
tokens. With that approach it was possible to make the symbols clickable with
"pixel accuracy". That greatly improved the general UX, performance and browser
compatibility. Maybe there will be  a separate export/import function for just
the Token Set in the future to make the above procedure a bit safer.

## How to change the code

### DEV Setup

 * Get a good IDE. PyCharm worked fine for me. With the Typescript stuff the
   professional edition really helped.
 * Clone the repository.
 * Install the required software according to instructions of the project:
   * npm/NodeJS (the on in your distro may be too old...)
   * Python 3 >= 3.7 and pip3 in case it is not included. Usually the one in your distro will do - even for Debian Stable.
   * Typescript
 * Create a Python Virtual Environment (PyCharm may do that for you) and activate it.
 * Install the dependencies:
   * In `obm_server`: 
     * `pip3 install -r requirements.txt`
     * `pip3 install -r dev_requirements.txt`
   * In `obm_react`: `npm install`
   
### Run Application in DEV:

 * To run the Server API on Port 8000, start in `obm_server`: `./start_debug.py`
   * You may also run this script in PyCharm's Debugger!
 * To start the React Dev-Server on Port 3000 run: `./start_react_dev.sh`
   * That one you will have stop/restart once in the while. After some time it will
     tend to give strange and misleading warnings and error messages.
 * Connect to http://localhost:3000 to access the application. The React DEV server is
   configured to proxy the API calls to port 8000. Most of the time it does. Sometimes
   you will see the 'connection reset' errors. That's actually an issue with the React DEV server.
   It is very easy to overload.
 * The configuration (Admin Secret!) and the dynamic data can be found in
   `~/open_battle_map_data`.
   
### Test

This application comes with three sets of tests. They are run by `prepare_build.sh`
but can and should be run more often:

 * PyTest unit tests in `obm_server/tests`
 * PyTest integration tests in `obm_server/integration_tests`
 * Jest unit tests in `obm_react`

Also, I feel guilty that I only wrote so few of them yet.


## Roadmap

### January 2021

 * Add a few more hot keys

### February 2021

 * Vehicles: Tokens that carry/move tokens placed on them.
 * Generic tokens without facing
 * Environment Effect Tokens: Fire, Smoke, Mud

### Someday

 * Custom Token Sets: Collections of custom tokens, which can be loaded
   into a Map Set.

### Postponed or Canceled Features

 * Turn the map: Surprisingly complex feature with little practical value.
   For now I go on without that one.

## Project History
 * 2021-01-19: **v0.5** - Added hotkeys for map move and zoom
 * 2021-01-16: **v0.4** - Laser Pointer feature
 * 2021-01-10: **v0.3** - More tokens and measurement functions.
 * 2021-01-07: **v0.2** - Switched polling from "1 poll per second per client" to "client polls after 0.1
   seconds but answer is delayed up to 30s if nothing happens". 
 * 2021-01-05: **v0.1** - Added Letsencrypt to AWS deployment - verified for Letsencrypt staging
 * 2021-01-03: Scripted deployment on AWS works (open_battle_map_cdk project)
 * 2020-12-31: Minimal feature set done
 * 2020-12-02: First commit

## Copyright

This software was written by Harald Wilhelmi. It may be used and distributed
under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.

## Credits

There are a few people I would like thank:
 * Sebastián Ramírez for FastAPI, which is just a fantastic idea.
 * The countless contributors of countless JS/Typescript modules I used.
 * Daniel Roesler for sharing https://github.com/diafygi/acme-tiny, which is used
   in the Docker image if TLS is enabled.
