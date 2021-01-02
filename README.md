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
players have limited insight what is going own like poker, you need something
completely different. 

## How to run?

The preferred way to run a Open Battle Map is as a docker container. To create
a docker image do this:

 * Before you start working, make sure you have:
   * Linux (Is that a problem? ... https://dilbert.com/strip/1995-06-24)
   * A reasonable up-to-date npm/NodeJS (the Debian Stable NodeJS is to old...).
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
     This is not very useful because most likely your friends will not be able to reach the
     service. However, it helps to test and also the scripts should you give a hint how to run the
     image on your preferred Docker host.
   * The image can then be deployed to e.g. to AWS with the cdk-Setup also found in the deploy folder. 
     * TODO
 
## More features

TODO

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
     * `pip3 install -r /srv/app/requirements.txt`
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
   It is very easy to overload.:
 * The configuration (Admin Secret!) and the dynamic data can be found in
   `~/open_battle_map_data`.
   
### Test

This application comes with three sets of tests. All of them should run and
updated before releasing:

 * PyTest unit tests in `obm_server/tests`.
 * PyTest integration tests in `obm_server/integration_tests`
 * Jest unit tests in `obm_react`.


## Roadmap

 * January 2021:
   * AWS Deployment
 * February 2021:
   * Vehicles: Tokens that carry/move tokens placed on them.
   * Generic tokens without facing
   * Environment Effect Tokens: Fire, Smoke, Mud
 * Someday:
   * Custom Token Sets: Collections of custom tokens, which can be loaded
     into a Map Set.

## Project History

 * 2020-12-31: Minimal feature set done
 * 2020-12-02: First commit