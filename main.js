// File with prepared set of emotes.
const DEFAULT_EMOTES_URL = chrome.runtime.getURL('default_emotes/emotes.json');

// IV variable for AES algorithm.
const IV = new Uint8Array([
    103, 105, 116, 104, 
    117, 98, 32, 98, 
    101, 108, 111, 119
]);

// Private Key for AES algorithm.
const PRIVATE_KEY = new Uint8Array([
    108, 105, 110, 107, 58, 32, 103, 105, 
    116, 104, 117, 98, 46, 99, 111, 109, 
    47, 97, 114, 116, 117, 114, 45, 119, 
    101, 99, 108, 97, 119, 115, 107, 105
]);

// Map of emotes converted from JSON.
let emoteMap = null;

// Crypto key for encryption and decryption data.
let cryptoKey = null;


// Generetes Crypto Key for encrypting and decrypting data .
// @return Generated crypto key.
async function generateCryptoKey() {
    return await crypto.subtle.importKey(
        "raw", 
        PRIVATE_KEY, 
        { name: "AES-GCM" }, 
        false, 
        ["encrypt", "decrypt"]
    );
}


// Encrypts data.
// @param [data] Data to be encrypted.
// @return Encrypted data.
async function encryptData(data) {
    const dataInJSONString = JSON.stringify(data);
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(dataInJSONString);
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: IV },
        cryptoKey,
        encodedData
    );

    return Array.from(new Uint8Array(encryptedData));
}


// Decrypts data.
// @param [encryptedData] Data to be decrypted.
// @return Decrypted data as a parsed JSON object.
async function decryptData(encryptedData) {
    const encryptedBytes = new Uint8Array(encryptedData);
    const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: IV },
        cryptoKey,
        encryptedBytes
    );

    const textDecoder = new TextDecoder();
    return JSON.parse(textDecoder.decode(decryptedData));
}


// Updates emoteMap in chrome.storage.local with new value.
// @param [data] Data to be saved in chrome.storage.local.
// @return Resolves when the data is successfully stored.
function updateEmotesInStorage(data) {

    return new Promise((resolve, reject) => {
        encryptData(data).then((encryptedData) => {

            // Converted encrypted data to a String used to store it in chrome.storage.local.
            const encryptedDataInBase64String = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
            chrome.storage.local.set({ emoteMap: encryptedDataInBase64String }, () => {
                if (chrome.runtime.lastError) {
                    console.log("Unable to update data.");
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        }).catch((error) => {
            console.log("Unable to update data: ", error);
            reject(error);
        });
    });
}


// Initializes the emote map by loading and decrypting stored data or fetching default data from file.
// @return Resolves with the decrypted or fetched [emoteMap] object.
function initializeEmotes() {

    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['emoteMap'], async (result) => {
            if (result.emoteMap) {
                try {
                    // Converted encrypted data to a Uint8Array to decode.
                    const encryptedDataInUint8Array = new Uint8Array(atob(result.emoteMap).split('').map(c => c.charCodeAt(0)));
                    emoteMap = await decryptData(encryptedDataInUint8Array);
                    resolve(emoteMap);
                } catch (error) {
                    console.log("Unable to save data to emoteMap: ", error);
                    reject(error);
                }
            } else { // If chrome.storage.local is empty.
                try {
                    const response = await fetch(DEFAULT_EMOTES_URL); // Fetched data from file.
                    emoteMap = await response.json(); // Saved data to [emoteMap].
                    await updateEmotesInStorage(emoteMap);
                    resolve(emoteMap);
                } catch (error) {
                    console.log("Unable to fetch data from default file: ", error);
                    reject(error);
                }
            }
        });
    });
}


// Replaces text in messages to emotes from [emoteMap].
function replaceTextInMessages() {
    if (!emoteMap) return;

    // Query selector with collected all message bubbles.
    const messages = document.querySelectorAll('.html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a');
    messages.forEach((message) => {
        message.childNodes.forEach((node) => {
            if (node.nodeType !== Node.TEXT_NODE) return;

            const originalText = node.nodeValue; // Text from message.
            const emotesKeys = Object.keys(emoteMap).join('|'); // Formated keys from [emoteMap] to `a|b|c|...`.
            const emoteRegex = new RegExp(`\\b(${emotesKeys})\\b`, 'g'); // Regex with all emotes names.
            const singleEmoteRegex = new RegExp(`^\\s*\\b(${emotesKeys})\\b\\s*$`, 'g'); // [emoteRegex] but for single word with optional spaces.
            const changedText = originalText.replace(emoteRegex, function(match) {
                const emoteURL = emoteMap[match]; // Emote URL from regex match.
                const isOnlyEmote = singleEmoteRegex.test(originalText); // Checks if text contains only single emote.
                const style = isOnlyEmote
                    ? "margin-bottom: -10px; padding-bottom: 5px;" // Added extra padding for single emote in message.
                    : "margin-bottom: -10px;";

                return '<img src="' + emoteURL +'" alt="' + match + '" title="' + match + '" style="'+ style + '" >';
            });
            if (changedText === originalText) return;

            const newNode = document.createElement("span");
            newNode.innerHTML = changedText;
            message.replaceChild(newNode, node); // Replaces original text [node] with new emote [newNode].
        });
    });
}


generateCryptoKey().then((key) => {
    cryptoKey = key;

    initializeEmotes().then(() => {
        replaceTextInMessages();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') { // Calls a function to handle text replacements when mutations occur.
                    replaceTextInMessages();
                }
            });
        });

        observer.observe(document.body, { // Observes changes on page.
            childList: true,
            subtree: true
        });
    }).catch((error) => {
        console.error('Error initializing emotes:', error);
    });

}).catch((error) => {
    console.error('Error importing crypto key:', error);
});