class Emotes {

    // Dictionary of emotes.
    #dict;

    // String used to store and share data.
    #shareCode;
    
    // Initialize the dictionary as null and shareCode as an empty string.
    constructor() {
        this.#dict = null;
        this.#shareCode = "";
    }

     // Get the current dictionary of emotes.
    getDictionary() {
        return this.#dict;
    }

    // Set a new dictionary, sorting it before.
    setDictionary(dict) {
        this.#dict = Emotes.sortDictionary(dict);
    }

    // Get the current share code.
    getShareCode() {
        return this.#shareCode;
    }
    
    // Set a new share code.
    setShareCode(code) {
            this.#shareCode = code;
    }

    // Add a new emote to the dictionary and re-sort the dictionary.
    addEmote(key, value) {
        this.#dict[key] = value;
        this.#dict = Emotes.sortDictionary(this.#dict);
    }

    // Remove an emote from the dictionary and re-sort the dictionary.
    removeEmote(key) {
        delete this.#dict[key];
        this.#dict = Emotes.sortDictionary(this.#dict);
    }

    // Get a specific emote by key.
    getEmote(key) {
        return this.#dict[key];
    }

    // Sort the given dictionary: first alphabetically by key, then by the length of the key if keys are identical.
    static sortDictionary(dict) {
        return Object.fromEntries(
            Object.entries(dict).sort((a, b) => {
                const alphaSort = a[0].toLowerCase().localeCompare(b[0].toLowerCase());
                if (alphaSort !== 0) {
                    return alphaSort;
                }
                return b[0].length - a[0].length;
            })
        );
    }
}

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

// Crypto key for encryption and decryption data.
let cryptoKey = null;

// Initializes [emotes] object.
const emotes = new Emotes();

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
    const messages = document.querySelectorAll('.html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a');
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


// Create modal.
function createModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100vw';
    modalOverlay.style.height = '100vh';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '10000';
    modalOverlay.style.visibility = 'hidden';
  
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    modalContent.style.minWidth = '300px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.textAlign = 'center';
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';

    const addNewEmoteButton = document.createElement('button');
    addNewEmoteButton.textContent = 'Add new emote';
    const removeEmoteButton = document.createElement('button');
    removeEmoteButton.textContent = 'Remove emote'; 
    const shareEmoteseButton = document.createElement('button');
    shareEmoteseButton.textContent = 'Share emotes';
  
    modalContent.innerHTML = `<h2>Temp modal!</h2>`;
    Object.fromEntries(
        Object.entries(emotes.getDictionary()).map(([key, value]) => {
            const img = document.createElement('img')
            img.src = "https://cdn.7tv.app/emote/" + value + "/2x.webp";
            img.id = key;
            img.addEventListener('click', (e) => {
                console.log("It will open modal with delete or just close it in container with delete button, idk, id: " + e.target.id)
            })
            return modalContent.appendChild(img);
            }));
    modalContent.appendChild(closeButton);
    modalContent.appendChild(addNewEmoteButton);
    modalContent.appendChild(removeEmoteButton);
    modalContent.appendChild(shareEmoteseButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
    closeButton.addEventListener('click', () => {
      modalOverlay.style.visibility = 'hidden';
    });
    shareEmoteseButton.addEventListener('click', () => {
        navigator.clipboard.writeText(emotes.getShareCode());
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.visibility = 'hidden';
      }
    });
  
    return modalOverlay;
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
                // Original button that opens emote menu.
                const metaEmojiButton = document.querySelector('[aria-label="Choose an emoji"]');

                if (metaEmojiButton && !metaEmojiButton.parentNode.querySelector('[aria-label="Choose a better emoji"]')) {
                    const betterMetaChatButton = document.createElement('div');
                    betterMetaChatButton.role = 'button';
                    betterMetaChatButton.textContent = '🙁';
                    betterMetaChatButton.setAttribute('aria-label', 'Choose a better emoji');
                    betterMetaChatButton.style.height = '24px';
                    betterMetaChatButton.style.width = '24px';
                    
                    // Tworzenie modalu (raz)
                    const modal = createModal();
                    // Otwórz modal po kliknięciu
                    betterMetaChatButton.addEventListener('click', () => {
                    modal.style.visibility = 'visible';
                    });

                    // Wstaw nowy przycisk obok emoji
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