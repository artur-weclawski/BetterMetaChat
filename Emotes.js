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