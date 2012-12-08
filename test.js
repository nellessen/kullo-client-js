
var kullo = new Kullo();
kullo.generate_rsa_keys();
kullo.generate_aes_keys();

function test() {
    
    var message = "Nachricht mit geheimem Text";
    var signiture = kullo.sign_string(message);
    console.log("Die Nachricht", message, "hat die Signatur", signiture);
    var valid = kullo.verify_signiture(message, signiture);
    console.log("Validierung:", valid);

    var encrypted_message = kullo.encrypt_rsa(message);
    console.log("Die Nachricht RSA-verschlüsselt:", encrypted_message);
    var decrypted_message = kullo.decrypt_rsa(encrypted_message);
    console.log("Die Nachricht RSA-entschlüsselt:", decrypted_message);
    
    kullo.generate_aes_keys();
    var encrypted = kullo.encrypt_aes(message);
    console.log("The encrypted message", encrypted);
    var decrypted = kullo.decrypt_aes(encrypted);
    console.log("The decrypted message", decrypted);
}

function test_encode() {
    var message = "Nachricht mit geheimem Text";
    var address = "simon!kullo.org";
    var composedMessage = kullo.composeMessage(address, message);
    $('#ouput').html(composedMessage);
    console.log(kullo.decomposeMessage(composedMessage));
}