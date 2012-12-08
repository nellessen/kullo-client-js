/**
 * Main class.
 * 
 * All class member numbers are decimal!
 */
function Kullo() {
    this.public_key = null;
    this.private_key = null;
    this.key_length = 1024;
    this.e = 65537; // Hex value 10001
    this.generate_rsa = function() {
        var before = new Date();
        var rsa = new RSAKey();
        var dr = document.rsatest;
        console.log("Generating RSA Key...");
        rsa.generate(parseInt(this.key_length.toString()),this.e.toString(16));
        this.public_key = {
                e: this.e,
                N: rsa.n
        };
        this.private_key = {
                e: rsa.d,
                N: rsa.n
        };
        /*
        console.log("N = ", rsa.n.toString(16));
        console.log("d = ", rsa.d.toString(16));
        console.log("p = ", rsa.p.toString(16));
        console.log("q = ", rsa.q.toString(16));
        */
        // dr.dmp1.value = linebrk(rsa.dmp1.toString(16),64);
        // dr.dmq1.value = linebrk(rsa.dmq1.toString(16),64);
        // dr.coeff.value = linebrk(rsa.coeff.toString(16),64);
        var after = new Date();
        console.log("Key Generation Time: " + (after - before) + "ms");
    };
}

function test() {
    var kullo = new Kullo();
    kullo.generate_rsa();
    console.log(kullo.public_key);
    console.log(kullo.private_key);
}