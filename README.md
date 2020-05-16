<p align="center"><img src="https://github.com/RobTheFiveNine/facebook-muted-words/blob/master/images/icon-128.png?raw=true" /></p>

<h1 align="center">Facebook Muted Words</h1>
<p align="center">
    <a href="https://github.com/RobTheFiveNine/facebook-muted-words/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/RobTheFiveNine/facebook-muted-words/workflows/build/badge.svg?branch=master" />
    <a href="https://coveralls.io/github/RobTheFiveNine/facebook-muted-words?branch=master"><img src="https://coveralls.io/repos/github/RobTheFiveNine/facebook-muted-words/badge.svg?branch=master" /></a>
</p>

<p align="center">
  A browser extension to hide posts based on keywords whilst browsing the Facebook newsfeed
</p>

<hr>

Quick Setup
-----------
1. Install the extension from the Chrome Store (submission pending review)
2. Open the extension's options page by clicking the extension icon and clicking `Options`
3. Choose the "Local list" option in the source dropdown
4. Enter a list of words or phrases that you wish to mute (one word / phrase per line)
5. Click save

The next time you visit Facebook, any posts that appear in the main newsfeed that contain these words or phrases will be hidden from the newsfeed.

Using a Remote Word List
------------------------
If you'd like to share the configuration across multiple computers, you can create a text file containing the muted words / phrases (again, one per line) and upload that to a web server. To then use this file, open the extension's options page and change the source setting to `URL` and enter the URL of the wordlist in the textbox that appears; then click the save button.

The contents of the wordlist will be downloaded the next time Facebook is visited. A copy of the wordlist will be cached by the extension, and used until the next time Facebook is visited.

Supported Browsers
------------------
Currently, the extension only works on Google Chrome (tested on 81.0.4044.138).

Building from Source
--------------------
To build your own copy of the extension from source, you will need to have the following prerequisites installed:

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)

Once these are installed, follow these steps:

1. Clone this repository: `git clone https://github.com/RobTheFiveNine/facebook-muted-words.git`
2. Install the dependencies: `cd facebook-muted-words && yarn`
3. Run the build script: `yarn build`

After following these steps, the extension will be built into the `build/` directory, where it can be loaded into Chrome in developer mode.

If you would like to use a separate profile to your normal profile for testing purposes, run `yarn chrome` in the `facebook-muted-words` directory to launch an instance of Chrome which uses a profile stored in `facebook-muted-words/.profile`

License
-------
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

