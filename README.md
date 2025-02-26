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

## General info
This project is inspired by [BetterTTV](https://betterttv.com/) and [7tv](https://7tv.app/) (extensions to [Twitch](https://twitch.tv)).

Extension replaces text with emotes from [7tv](https://7tv.app/).

Thanks to identical chat structure it works on [Facebook](https://facebook.com/), [Messenger](https://messenger.com/) and [Instagram](https://instagram.com/).

### Functions
 * Replacing text with emotes.
 * Menu with preview of all added emotes by you (not yet implemented).
 * Adding and deleting own emotes from [7tv](https://7tv.app/) (not yet implemented).
 * Sharing emotes sets with others (not yet implemented).

### Preview
...

## Instalation
### Requirements
Browser supporting Chrome extensions.
### Instalation process
...

## Changelog

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
