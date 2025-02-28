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