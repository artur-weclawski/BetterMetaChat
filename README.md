# BetterMetaChat
Extension to chrome based browsers adding emotes to Meta communicators.

## Table of contents
* [General info](#general-info)
  * [Functions](#functions)
  * [Preview](#preview)
* [Instalation](#instalation)
  * [Requirements](#requirements)
  * [Instalation process](#instalation-process)
* [Changelog](#changelog)
* [Known issues](#known-issues)

## General info
This project is inspired by [BetterTTV](https://betterttv.com/) and [7tv](https://7tv.app/) (extensions to [Twitch](https://twitch.tv)).

Extension replaces text with emotes from [7tv](https://7tv.app/).

Thanks to identical chat structure it works on [Facebook](https://facebook.com/), [Messenger](https://messenger.com/) and [Instagram](https://instagram.com/).

Icons for buttons taken from https://icon-sets.iconify.design/material-symbols/.

### Functions
 * Replacing text with emotes.
 * Menu with preview of all added emotes by you.
 * Adding and deleting own emotes from [7tv](https://7tv.app/).
 * Sharing emotes loadouts with others.
 * Pasting emotes directly to written message.

### Preview
...

## Instalation
### Requirements
Browser supporting Chrome extensions. Minimum requirments for css (anchoring) support: Edge 125, Chrome 125, Opera 111.

### Instalation process
...

## Changelog

### v1.2 (05-03-2025)
* Added menu with previews of all emotes.
* Adeed importing and removing emotes.
* Added sharing emote sets.
* Added styling for light and dark mode.
* Added pasting emotes from menu directly to chat.
* Fixed most validation problems and bugs from previous versions<!-- (added few more)-->.


---

### v1.1.1 (06-02-2025)
 * Added bigger size for single emote in message.

---

### v1.1 (06-02-2025)
 * Added Emotes class.
 * Added sorting emotes: first alphabetically, then by the length.

---

### v1.0 (30-01-2025)
 * Added replacing text with emotes.
 * Added encrypting and decrypting data for easier storing and sharing emotes sets.
 * Added different styling for single emote and message containing text and emotes.
 * Added a title (on hover) to emotes (easier to identify).
 * Added JSON file with set of few default emotes.
 * Emotes are now saved and retrieved from chrome.storage.local rather than only from a file (initialization or empty storage).

## Known issues
 * After pasting emote when input field already contains text, the cursor is placed at the beginning.
 * When using instagram, the button that opens menu also opens original menu. (Both messenger and facebook use same container for original button, but instagram sets `aria-label` for `<svg>` element.)
 * Extension works only if language is set to English or Polish. (The list of languages ​​must be expanded manually, at the end of `main.js`.)
 * Extension button might covers part of the text. (Button position is set to `fixed`. Element is anchored to original button, because each chat uses different direction to display elements in container.)
 * Colors on instagram are slighty off.
