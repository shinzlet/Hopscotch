<h1 align="center">
	<span style="width: 50%;">
		<img alt="logo" src="assets/img/hopscotch-icon128.png" style="display: inline-block; float: left;" width=24px>
		<span>Hopscotch</span>
	</span>
</h1>

# Hopscotch provides a more intuitive browsing experience
Hopscotch is a Google Chrome extension designed to non-intrusively allow you to save your history as a convenient tree, which makes finding that one page you lost much easier.

How does this work?
### With the power of trees!
Conventionally, browsers store a very narrow minded snippet of your history that you can traverse. When you press the forward button, you go to whatever the last thing you went to from the current page was, and the back button is similar. The problem is, whenever you go to a new page, that old forward history is completely sheared off! This means you loose a lot of organized information, and makes it a lot harder to find pages you're looking for.

Hopscotch, on the other hand, won't delete those pages in front of you. Whenever you go to a new page from another, it creates a branch off of the parent page, allowing it to be a separate path from the other pages. Then, when you want to find the page you were looking for, you can just follow that path to get there.

<img align="center" src="http://i.imgur.com/7eKOZ6j.png" alt="A screenshot showing the Hopscotch toolbox.">

### Why is this better than going to your browser history and looking there?
Browser history is **chronological**, meaning all it cares about is when you were on a page. Hopscotch is a web of linked topics, which means that it keeps track of things the same way you do - by what you were doing (or looking at) when you found that page.

# Hopscotch kills tabs (in a good way)
Hopscotch doesn't just make it easier to find things, though. It also provides a large overhaul on top of the default tab system found in most browsers. Because of it's tree-based nature, Hopscotch doesn't like tabs, as they each behave like their own separate history list. Under the hood, Hopscotch connects all of your tabs to a common root, so that each tab is just like a window that looks at some part of the main tree.

### What do I get out of that?
For the user, this allows tabs to not store any data. If you close a tab, all of that nice linked history you built up in it is still there, and if you want to, you can just move another tab so that it's looking at that history. You don't even need to close a tab to do that! You can move two (or more) tabs to the same node on the tree, and look at different pages in all of them, and then find any of those new pages in any of the tabs!

Seriously, it's great.

# Do I have to do anything to keep it working?
Not unless you want to. Hopscotch is configured by default to handle everything by itself. If you'd like more accurate control (choosing what happens when you open a new tab, for example), you can do that too! Hopscotch has a small settings menu that lets you configure it so that it works how you want it to.

# How do I install Hopscotch?
As I've not yet thrown it on the chrome store, you can't get it the usual way. However, if you go to the releases section and click download (or press this link), you'll get the extension file (likely called Hopscotch.crx). Now, go to chrome://extensions in your browser, and drag the file from your downloads folder (or the chrome downloads bar) into the middle of the page. It will ask you if you're cool with Hopscotch having it's permissions, but I'll leave that choice up to you. (Read the source code if you don't trust me.) After that, you should be good to go. If you want to, restarting Chrome will make the experience a whole lot simpler. If you don't, refresh your pages.

# How do I use it?
To open the Hopscotch toolbox (as shown in the screenshot above), press both Alt keys. In the future, I'm planning on making that easily configurable by the user, but there are ways to change it if you really want to. In the top left of your screen, a little box should pop up. If so, you've done it!

<img src="http://i.imgur.com/3ZvCFHx.png">

Hopscotch's toolbox has three parts:
- The toolbar,
- The sandwich,
- And the chinbar.

The toolbar (the fancy thing at the top), has three buttons. The far left and right buttons respectively pull up the link browser and the settings menu. The other button reloads the links shown in the browser, but in theory Hopscotch should handle all of that for you.

The sandwich is actually what the settings window and link browser are called together. When I started working on this, there were three windows (like how sandwiches are, y'know?), and the name stuck. All you need to know is that this is where the links and settings will be shown. If you want to change a setting, just click it.

Finally, the chinbar is the small panel beneath the sandwich. It allows you to interact with the link browser. In left to right order, the buttons are: backstep, remove, and resolve. The backstep button simply lets you step backwards in the tree. It's very similar to your browser's back button, but it doesn't change the page - just what links are shown in the toolbox. Remove allows you to delete a branch of the tree (we'll get to how in a second), which is handy from time to time. Resolve is typically not used, but if you configure Hopscotch to ask you where new branches should go, you will use resolve to tell it.

### So, we know how to go back in the browser. There isn't a forward button, though!
Because there are multiple links to go forward to, we have to specify which one. If you click on a link, it will take you to that page. So, how do we go forward in the link browser?

<img src="http://i.imgur.com/Q3wa3Mu.png">

That's where **action mode** comes in. By right clicking a link, it'll change the title's color to indicate you've selected it. From here, you have a couple choices. Left clicking that same link will do what we wanted, moving the link browser to see it's branches. However, we can also press the remove button to delete the selected branch, or (if it's not disabled) the resolve button, which will hook your current branch to that node.

# If you want to stop reading now, that's fine.
From this point on, we're getting to the niche feature set that you probably won't need. Even I don't use (much of) this stuff, but I felt like I should add it.

### What all the settings do:
- Toggle (on/off) settings:
	- Scrollbar Hiding: If on, this will hide the scrollbar on webpages. It's lovely. (and keeps the page from jittering when you mouse over the Hopscotch toolbox).
	- Tree Simplification: If you turn this off, you might break stuff. It prevents pages from duplicating every time you go to them.
	- Attempt Stitching: If Hopscotch has a panic attack and looses track of where you're browsing (or doesn't know in the first place), it will try to find a nice place to put you on the tree.
- Multiple option settings:
 	- New Tab: Where your branch will be put on the tree when you make a new tab.
		- Branch (default): Creates a new branch on the root node.
		- Leaf: Creates a leaf node on wherever you were last browsing.
		- Prompt: Asks you what to do (this means you will have to use resolve. Ick!)
	- Manual: Where your branch will be if you manually change pages (not a link, but typing a url or clicking a bookmark)
		- All of the settings are the same as New Tab. (default: Leaf)
	- Stitch Fail: Where your branch should go if stitching fails (or you've turned stitching off)
		- The same as the options for 'Manual', but leaf is not an option.

### How to use resolve:
If you've configured hopscotch so that it'll bother you on events (if you set anything to 'prompt'), you will occasionally see a little blue circle with an exclamation point on it. This tells you that Hopscotch doesn't know where your browsing should go.

If you ignore it, your browsing will be tracked in it's own independent tree. This comes at a cost, though - You can't use Hopscotch to navigate through it. If you want to use it correctly, you must attach your tree to the main tree.

To do this, you can either click on the attention widget (the circle), or open the Hopscotch Toolbox another way. Then, you enter action mode on the node you want to attach your browsing to and press resolve. The link browser will now show your browsing.
