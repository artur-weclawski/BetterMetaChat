// File with prepared set of emotes.
const DEFAULT_EMOTES_URL = chrome.runtime.getURL('default_emotes/emotes.json');

// Initializes [emotes] object.
const emotes = new Emotes();


// Updates [emotes] in chrome.storage.local with new value.
// @param [data] Data to be saved in chrome.storage.local.
// @return Resolves when the data is successfully stored.
function updateEmotesInStorage(data) {

    return new Promise((resolve, reject) => {
        encryptData(data).then((encryptedData) => {

            // Converted encrypted data to a String used to store it in chrome.storage.local.
            emotes.setShareCode(btoa(String.fromCharCode(...new Uint8Array(encryptedData))));
            chrome.storage.local.set({ emotes: emotes.getShareCode() }, () => {
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



// Updates [emotes] in chrome.storage.local with new value.
// @param [shareCode] Data to be saved in chrome.storage.local.
// @return Resolves when the data is successfully stored.
function updateEmotesInStorageByShareCode(shareCode){

    return new Promise((resolve, reject) => {
        const currentShareCode = emotes.getShareCode();
        isValidShareCode(shareCode).then((isValid) => {
            if (!isValid) {
                alert("Provided code is wrong")
                shareCode = currentShareCode;
            }
        emotes.setShareCode(shareCode)
        chrome.storage.local.set({ emotes: emotes.getShareCode() }, () => {
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


// Checks if [shareCode] is valid.
// @param [shareCode] Data to valid.
// @return bool.
async function isValidShareCode(shareCode) {
    try {
        // Preparing [shareCode] to decrypt.
        let dataToDecrypt = new Uint8Array(atob(shareCode).split('').map(c => c.charCodeAt(0)));
        // Initializes [emotesToValid] object.
        const emotesToValid = new Emotes();
        emotesToValid.setDictionary(await decryptData(dataToDecrypt));

        if (emotesToValid.getDictionary() === null) {
            return false;
        }

        const keys = Object.keys(emotesToValid.getDictionary());
        if (keys.length === 0) {
            return false;
        }

        if (!Object.values(emotesToValid.getDictionary()).every(val => val !== null && val !== undefined && val !== '')) {
            return false;
        }

        return true;
    } catch (error) {
        console.log("Validation error: ", error);
        return false;
    }
}


// Initializes the emote dictionary by loading and decrypting stored data or fetching default data from file.
// @return Resolves with the decrypted or fetched [emotes.dict].
function initializeEmotes() {

    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['emotes'], async (result) => {
            if (result.emotes) {
                try {
                    // Converted encrypted data to a Uint8Array to decode.
                    const encryptedDataInUint8Array = new Uint8Array(atob(result.emotes).split('').map(c => c.charCodeAt(0)));
                    emotes.setDictionary(await decryptData(encryptedDataInUint8Array));
                    emotes.setShareCode(result.emotes);
                    resolve();
                } catch (error) {
                    console.log("Unable to save data to emotes: ", error);
                    chrome.storage.local.set({emotes: ''});
                    reject(error);
                }
            } else { // If chrome.storage.local is empty.
                try {
                    const response = await fetch(DEFAULT_EMOTES_URL); // Fetched data from file.
                    emotes.setDictionary(await response.json()); // Saved data to [emotes.dict].
                    await updateEmotesInStorage(emotes.getDictionary());
                    resolve();
                } catch (error) {
                    console.log("Unable to fetch data from default file: ", error);
                    reject(error);
                }
            }
        });
    });
}


// Replaces text in messages to emotes from [emotes.dict].
function replaceTextInMessages() {
    if (!emotes.getDictionary()) return;
    // Query selector with collected all message bubbles.
    const messages = document.querySelectorAll('.html-div.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1gslohp.x14z9mp.x12nagc.x1lziwak.x1yc453h.x126k92a');
    messages.forEach((message) => {
        message.childNodes.forEach((node) => {
            if (node.nodeType !== Node.TEXT_NODE) return;

            const originalText = node.nodeValue; // Text from message.
            const emotesKeys = Object.keys(emotes.getDictionary()).join('|'); // Formated keys from [emotes.dict] to `a|b|c|...`.
            const emoteRegex = new RegExp(`\\b(${emotesKeys})\\b`, 'g'); // Regex with all emotes names.
            const singleEmoteRegex = new RegExp(`^\\s*\\b(${emotesKeys})\\b\\s*$`, 'g'); // [emoteRegex] but for single word with optional spaces.
            const changedText = originalText.replace(emoteRegex, function(match) {
                const emoteURL = emotes.getEmote(match); // Emote URL from regex match.
                const isOnlyEmote = singleEmoteRegex.test(originalText); // Checks if text contains only single emote.
                const style = isOnlyEmote
                    ? "margin-bottom: -10px; padding-bottom: 5px;" // Adds extra padding for single emote in message.
                    : "margin-bottom: -10px;";
                const size = isOnlyEmote
                    ? "3x" // Adds bigger size for single emote in message.
                    : "1x";
                return '<img src="' + "https://cdn.7tv.app/emote/" + emoteURL + "/" + size + ".webp" +'" alt="' + match + '" title="' + match + '" style="'+ style + '" >';
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
                const pageLanguage = document.documentElement.lang;
                // Original button that opens emote menu.
                const metaEmojiButton = document.querySelector('[aria-label="' + AriaLabelValue[pageLanguage] +'"]');
                
                // If original button is present and new one isn't created.
                if (metaEmojiButton && !metaEmojiButton.parentNode.querySelector('[aria-label="Choose a better emoji"]')) {
                    // Create modal with emotes.
                    const modal = createEmoteMenuModal();
                    // Create extension button.
                    const betterMetaChatButton = createButton(
                        'img', 
                        'bmc-emote-menu-button', 
                        'button', 
                        'icons/bmc-icon.svg', 
                        {name: 'aria-label', value: 'Choose a better emoji'}
                    )

                    betterMetaChatButton.addEventListener('click', () => {
                        modal.style.visibility = 'visible';
                    });
                    // Add new button next to original one (in code).
                    metaEmojiButton.parentNode.insertBefore(betterMetaChatButton, metaEmojiButton.nextSibling);
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


// Enum with aria-labels, need to be extended if you are using different page language.
const AriaLabelValue = Object.freeze(
    {
        en: "Choose an emoji",
        pl: "Wybierz ikonę emoji"
    }
)