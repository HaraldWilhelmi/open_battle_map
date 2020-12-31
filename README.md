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

## How does it work?

 * Install it on a server both you and your friends can reach. For me this was
   AWS EC2 instance (TBD: sizing) worked. Of cause you can also install it on a
   local machine and expose the port through your router with DNAT. In my experience
   that is not worth the trouble.  
 * Get your admin secret from the configuration file written on the first run.
 * Visit your web server port 8000, enter the admin secret and bookmark
   the admin link in your browser. You will need it to manage your map sets.
 * Create your first map set.
 * Configure your initial map by uploading a background image. You need the
   image in a browser friendly format. SVG is best because it scales so nicely
   but PNG, JPEG, or GIF will all do.
 * If you care for the measurement tools also set the map scale.
 * If you need more than the generic tokens define some custom tokens. This tokens are
   always shared among all maps of the same map set. You want to do this especially if
   your tokens don't have facing on the map. Most of generic tokens have this feature and are
   cumbersome to move if you don't care about it.
 * When you are done, make a local backup of your map set by downloading it from the server.
 * Send the link to the map set to your friend, e.g. by email.
 * Roll the dice and move the tokens!
 
## More features

TBC

## Project History

 * 2020-12-31: Minimal feature set done
 * 2020-12-02: First commit