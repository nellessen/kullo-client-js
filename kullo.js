/**
 * Main class.
 * 
 * All class member numbers are decimal!
 */
function Kullo() {
    this.public_key = null;
    this.private_key = null;
    this.aes_key = null;
    this.key_length = 1024;
    this.e = 65537; // Hex value 10001
    
    /**
     * Generates public and private RSA Keys based on the key length
     * this.key_length and the exponent this.e.
     * 
     * It will set the results as this.public_key and this.private_key:
     * public_key = {
     *          e: this.e, // BigInteger
     *          N: rsa.n // BigInteger
     *  }
     * private_key = {
     *          d: this.d, // BigInteger
     *          N: rsa.n // BigInteger
     *  }
     */
    this.generate_rsa_keys = function() {
        console.log("Generating RSA Key...");
        var before = new Date();
        
        var rsa = new RSAKey();
        //var dr = document.rsatest;
        rsa.generate(this.key_length.toString(),this.e.toString(16));
        this.public_key = {
                e: this.e,
                N: rsa.n
        };
        this.private_key = {
                d: rsa.d,
                N: rsa.n
        };
        
        var after = new Date();
        console.log("Time: " + (after - before) + "ms");
    };
    
    /**
     * Signs a string based on the private key this.private_key and the
     * exponent this.e using SHA1 to hash the input. It returns 
     * the signature as a BigInteger.
     * 
     * @param {String} str The string to be signed.
     * @returns  {String} Returns the signed string as hex string.
     */
    this.sign_string = function(str) {
        console.log("Signing string...", str);
        var before = new Date();
        
        // Hash string using Google's CryptoJS lib.
        var hash_array = CryptoJS.SHA1(str);
        var hash_hex = hash_array.toString(CryptoJS.enc.Hex);
        var hash_bigint = parseBigInt(hash_hex, 16);
        
        // RSA Encrtypt using rsa2.js lib.
        var rsa = new RSAKey();
        rsa.n = this.private_key.N;
        rsa.e = this.e;
        rsa.d = this.private_key.d;
        // @todo: We could increase performance if p and q are still available.
        
        var signiture = rsa.doPrivate(hash_bigint);
        
        var after = new Date();
        console.log("Time: " + (after - before) + "ms");
        
        return signiture.toString(16);
    };
    
    /**
     * Verifies the signature of a string based on the public key
     * this.public_key (and the exponent this.public_key.e) using SHA1 to
     * hash the string.
     * 
     * @param {String} str The string to check the signature for.
     * @param {String} signature The signature as hex string.
     * @returns Returns True or False.
     */
    this.verify_signiture = function(str, signature) {
        // Decode to BigInteger.
        signature = parseBigInt(signature, 16);
        
        console.log("Verifying signature...", str);
        var before = new Date();
        
        // Hash string using Google's CryptoJS lib.
        var hash_array = CryptoJS.SHA1(str);
        var hash_hex = hash_array.toString(CryptoJS.enc.Hex);
        var hash_bigint = parseBigInt(hash_hex, 16);
        
        // RSA Encrypt using rsa2.js lib.
        var rsa = new RSAKey();
        rsa.n = this.public_key.N;
        rsa.e = this.public_key.e;
        
        var calculated_hash_bigint = rsa.doPublic(signature);
        
        var after = new Date();
        console.log("Time: " + (after - before) + "ms");
        
        return calculated_hash_bigint.compareTo(hash_bigint) == 0;
    };
    
    /**
     * RSA-Encrypts a message using the public key this.public_key.
     * 
     * @param {String} message The message to encrypt.
     * @returns {String} The PKCS#1 RSA encrypted message as hex string.
     */
    this.encrypt_rsa = function(message) {
        // Decode to BigInteger.
        //message = parseBigInt(message, 16);
        
        //console.log("Encrypt string...", message);
        var before = new Date();
        
        // RSA Encrypt using rsa2.js lib.
        var rsa = new RSAKey();
        rsa.n = this.public_key.N;
        rsa.e = this.public_key.e;

        //var encrypted_bigint = rsa.doPublic(message);
        var encrypted = rsa.encrypt(message);
        
        var after = new Date();
        //console.log("Time: " + (after - before) + "ms");
        
        //return encrypted_bigint.toString(16);
        return encrypted;
    };
    
    /**
     * RSA-decrypts a encrypted message using the private key this.private_key
     * and the exponent this.e.
     * 
     * @param {String} crypto The PKCS#1 RSA encrypted message to decrypt as hex string.
     * @returns {String} The decrypted message.
     */
    this.decrypt_rsa = function(crypto) {
        // Decode to BigInteger.
        //crypto = parseBigInt(crypto, 16);
        
        //console.log("Encrypt string...", str);
        var before = new Date();
        
        // RSA Decrypt using rsa2.js lib.
        var rsa = new RSAKey();
        rsa.n = this.private_key.N;
        rsa.e = this.e;
        rsa.d = this.private_key.d;
        // @todo: We could increase performance if p and q are still available.
        
        //var decrypted_bigint = rsa.doPrivate(crypto);
        var decrypted = rsa.decrypt(crypto);
        
        var after = new Date();
        //console.log("Time: " + (after - before) + "ms");
        
        //return decrypted_bigint.toString(16);
        return decrypted;
    };
    
    /**
     * Generates a random 128 bit long key and a 128 bit long initial vector
     * used for AES crypto. The result will be stored in this.aes_key and
     * this.aes_iv respectively.
     * 
     * Use CryptoJS.enc.Hex.parse() to generate a WordArray which you can pass
     * to CryptoJS.AES.encrypt().
     */
    this.generate_aes_keys = function() {
        var key_wordarray = CryptoJS.lib.WordArray.random(128/8);
        var key_string = key_wordarray.toString();
        this.aes_key = key_string;
        
        var key_wordarray = CryptoJS.lib.WordArray.random(128/8);
        var key_string = key_wordarray.toString();
        this.aes_iv = key_string;
    };
    
    /**
     * AES-Encrypts a message using the AES key this.aes_key and the initial
     * vector this.aes_iv.
     * 
     * @param {String} message The message to encrypt (UTF-8).
     * @returns {String} The ??? encrypted message as hex string.
     */
    this.encrypt_aes = function(message) {
        var key = CryptoJS.enc.Hex.parse(this.aes_key);
        var iv = CryptoJS.enc.Hex.parse(this.aes_iv);
        var encrypted = CryptoJS.AES.encrypt(message, key, {iv: iv});
        return encrypted;
    };
    
    /**
     * AES-Decrypts a message using the AES key this.aes_key and the initial
     * vector this.aes_iv.
     * 
     * @param {String} message The ??? encrypted message as hex string.
     * @returns {String} The decrypted message (UTF-8).
     */
    this.decrypt_aes = function(message) {
        var key = CryptoJS.enc.Hex.parse(this.aes_key);
        var iv = CryptoJS.enc.Hex.parse(this.aes_iv);
        console.log("Message:", message, "Key", key, "IV", iv);
        var decrypted = CryptoJS.AES.decrypt(message, key, {iv: iv});
        return decrypted.toString(CryptoJS.enc.Utf8);
    };
}