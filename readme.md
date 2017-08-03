<h1 align="center">
	<span style="width: 50%;">
		<img alt="logo" src="assets/img/hopscotch-icon128.png" style="display: inline-block; float: left;" width=24px>
		<span>Hopscotch</span>
	</span>
</h1>

# Hopscotch provides a more intuitive browsing experience
Hopscotch is a Google Chrome extension designed to non-intrusively allow you to save your history as a
convenient tree, which makes finding that one page you lost much easier.

How does this work?
### With the power of trees!
Conventionally, browsers store a very narrow minded snippet of your history that you can traverse.
When you press the forward button, you go to whatever the last thing you went to from the current
page was, and the back button is similar. The problem is, whenever you go to a new page, that old
forward history is completely sheared off! This means you loose a lot of organized information,
and makes it a lot harder to find pages you're looking for.

Hopscotch, on the other hand, won't delete those pages in front of you. Whenever you go to a new
page from another, it creates a branch off of the parent page, allowing it to be a separate path
from the other pages. Then, when you want to find the page you were looking for, you can just
follow that path to get there.

<img align="center" src="http://i.imgur.com/7eKOZ6j.png" alt="A screenshot showing the Hopscotch toolbox.">

### Why is this better than going to your browser history and looking there?
Browser history is **chronological**, meaning all it cares about is when you were on a page.
Hopscotch is a web of linked topics, which means that it keeps track of things the same way
you do - by what you were doing (or looking at) when you found that page.

# Hopscotch kills tabs (in a good way)
Hopscotch doesn't just make it easier to find things, though. It also provides a large overhaul
on top of the default tab system found in most browsers. Because of it's tree-based nature,
Hopscotch doesn't like tabs, as they each behave like their own separate history list. Under
the hood, Hopscotch connects all of your tabs to a common root, so that each tab is just like
a window that looks at some part of the main tree.

### What do I get out of that?
For the user, this allows tabs to not store any data. If you close a tab, all of that nice linked
history you built up in it is still there, and if you want to, you can just move another tab so
that it's looking at that history. You don't even need to close a tab to do that! You can move
two (or more) tabs to the same node on the tree, and look at different pages in all of them, and
then find any of those new pages in any of the tabs!

Seriously, it's great.

# Do I have to do anything to keep it working?
Not unless you want to. Hopscotch is configured by default to handle everything by itself.
If you'd like more accurate control (choosing what happens when you open a new tab, for example),
you can do that too! Hopscotch has a small settings menu that lets you configure it so that it
works how you want it to.


# How do I use it?
To open the Hopscotch toolbox (as shown in the screenshot above), press both Alt keys.
In the future, I'm planning on making that easily configurable by the user, but there
are ways to change it if you really want to. In the top left of your screen, a little
box should pop up. If so, you've done it!

<img src="http://i.imgur.com/3ZvCFHx.png">

Hopscotch's toolbox has three parts:
- The toolbar,
- The sandwich,
- And the chinbar.

The toolbar (the fancy thing at the top), has three buttons. The far left and right buttons
respectively pull up the link browser and the settings menu. The other button reloads the links
shown in the browser, but in theory Hopscotch should handle all of that for you.

The sandwich is actually what the settings window and link browser are called together. When I
started working on this, there were three windows (like how sandwiches are, y'know?), and the
name stuck. All you need to know is that this is where the links and settings will be shown.

Finally, the chinbar is the small panel beneath the sandwich. It allows you to interact with the
link browser. In left to right order, the buttons are: backstep, remove, and resolve. The
backstep button simply lets you step backwards in the tree. It's very similar to your browser's
back button, but it doesn't change the page - just what links are shown in the toolbox. Remove
allows you to delete a branch of the tree (we'll get to how in a second), which is handy from
time to time. Resolve is typically not used, but if you configure Hopscotch to ask you where
new branches should go, you will use resolve to tell it.
