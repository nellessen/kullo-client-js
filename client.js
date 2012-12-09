/**
 * This is the application file for the Kullo JavaScript Client.
 * 
 * @todo: There is no input validation at all. This is just a rapid prototype!
 */

/**
 * This class provides client-server communication.
 */
function KulloREST() {
    this.server = "https://kullo.net:3546/";
    this.sid = null;
    this.user = null;
        
    /**
     * A generic method for REST calls.
     */
    this.request = function(path, payload, method, success_callback) {
        $.ajax({
            url: this.server + path,
            data: payload,
            contentType: "application/xml",
            type: method,
            dataType: 'xml',
            timeout: 60000,
            cache: true
        }).done(function ( data ) {
            console.log("Response data:", data);
            if (typeof(success_callback) == "function") success_callback(data);
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
            // Release login form.
            $("#login-form button, #login-form input").removeAttr("disabled");
        });
    };
    
    /**
     * Performas a logout.
     * 
     * @todo: Implement REST calls.
     */
    this.logout = function() {
        this.sid = null;
        ui_logged_out();
    };
    
    /**
     * Performas a login (POST on /sessions).
     */
    this.login = function(address, password) {
        // Assamble payload.
        var payload = "<login><address>" + address + "</address><password>" + password + "</password></login>";
        var that = this;
        this.request("sessions", payload, "POST", function(data) {
            // Parse the response.
            try{
                var xml = $( data );
                var status = xml.find( "status" ).text();
                if (status == "error") {
                    alert("Login incorrect");
                }
                else {
                    var sid = xml.find( "sid" ).text();
                    if (!sid) {
                        console.log("The response contained invalid data");
                        return;
                    }
                }
            } catch(err) {
                console.log("The response contained invalid xml");
                alert("The response contained invalid xml");
                return;
            }
            // Session successwfully created.
            console.log("SID:", sid);
            that.sid = sid;

            // Adjust layout after successful login.
            if(sid) {
                ui_logged_in();
                that.user = address;
            }
            else {
                // Release login form.
                $("#login-form button, #login-form input").removeAttr("disabled");
            }
        });
    };
    
    /**
     * Performas sending a message (POST on /users/:address/letters).
     */
    this.send = function(recipient, message) {
        // Assamble payload.
        var payload = kulloAPI.composeMessage(recipient, message);
        var that = this;
        this.request("users/" + recipient + "/letters", payload, "POST", function(data) {
            // Parse the response.
            try{
                var xml = $( data );
                var status = xml.find( "status" ).text();
                if (status == "error") {
                    alert("Sending failed");
                }
                else if (status == "success") {
                    alert("Sending successful");
                    $("#compose-form .message").val("");
                    ui_show_inbox();
                }
            } catch(err) {
                console.log("The response contained invalid xml");
                alert("The response contained invalid xml");
                ui_show_home();
                return;
            }
        });
    };
    
    this.loadMessage = function(id) {
        // Assamble payload.
        var payload = "";
        var that = this;
        this.request("users/" + this.user + "/letters/" + id, payload, "GET", function(data) {
            //console.log("MSG", data);
            message = kulloAPI.decomposeMessage(data);
            $("#inbox").append("<li class='well' style='display: block;'><div class='container decrypted' ><article>" + $(data).find("messageContainer").text() + "</div><div disabled='disabled' style='display: none; ' class='container encrypted'>" + message + "</div></li>")
        });
    };
    
    /**
     * Performs sending a message (POST on /users/:address/letters).
     */
    this.loadInbox = function() {
        // Assamble payload.
        var payload = "";
        var that = this;
        $("#inbox li").remove();
        this.request("users/" + this.user + "/letters", payload, "GET", function(data) {
            // Parse the response.
            try{
                var xml = $( data );
                var letterList = xml.find( "letterList" ).text();
                if (letterList) {
                    $('letterList', xml).children('item').each(function() {
                        that.loadMessage(+ $(this).text());
                    });
                    //alert("Loading successful");
                    //$("#compose-form .message").val("");
                    //ui_show_inbox();
                }
                else {
                    // @todo: Strange !!!
                    console.log("Messages could not be loaded");
                    //alert("Messages could not be loaded");
                }
            } catch(err) {
                console.log("The response contained invalid xml");
                alert("The response contained invalid xml");
                ui_show_home();
                return;
            }
        });
    };
    
}

function ui_logged_in() {
    $("#login-form").fadeOut();
    $("#nav-logout").fadeIn();
    $("#nav-compose").fadeIn();
    $("#nav-inbox").fadeIn();
    $("#nav-generate").fadeIn();
    ui_show_home();
}

function ui_logged_out() {
    $("#nav-logout").fadeOut();
    $("#nav-compose").fadeOut();
    $("#nav-inbox").fadeOut();
    $("#nav-generate").fadeOut();
    $("#login-form button, #login-form input").removeAttr("disabled");
    $("#login-form").fadeIn();
    ui_show_home();
}

function ui_show_home() {
    $(".nav li").removeClass("active");
    $(".page").fadeOut('fast', function() {
        $("#page-home").fadeIn();
        $("#nav-home").addClass("active");
    });
    
}

function ui_show_inbox() {
    $(".nav li").removeClass("active");
    client.loadInbox();
    $(".page").fadeOut('fast', function() {
        $("#page-inbox").fadeIn();
        $("#nav-inbox").addClass("active");
    });
}

function ui_show_generate() {
    $(".nav li").removeClass("active");
    $("#nav-generate").addClass("active");

    kulloAPI.generate_rsa_keys();
    kulloAPI.generate_aes_keys();
    ui_show_home();
}

function ui_show_compose() {
    $(".nav li").removeClass("active");
    $(".page").fadeOut('fast', function() {
        $("#page-compose").fadeIn();
        $("#nav-compose").addClass("active");
    });
}

//Initialize REST Client.
client = new KulloREST();
kulloAPI = new Kullo();

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};
    
    // Example keys.
    var public_key = 
    {"N": parseBigInt("9690c1ba8939eda38966578738baa7ff79d5a7f08bfcb4faedd58a2dc332cd106f36d69a0754acf9f0b019db49d7188f1b8fd8e2fa4eccdb086beb23e0d4d74527653c38d251c4a2bd4fb4419062f3604b055f16d2260246d349590e110f5d3d64624e5496355d7f896761a5559df33117d580ba8403d8d16cd554a5eb7334af340a9e5090e9e6694e86c7d9b318fb9c5950a74ed4cbcb77cb88ec9edf8b1ab63f6b64a13dcf719eace2a2abde1ed1cd3d37579ba32ff3a340fa95ec528d93bd", 16),
     "e": 65537};
    var private_key = 
    {"N": parseBigInt("9690c1ba8939eda38966578738baa7ff79d5a7f08bfcb4faedd58a2dc332cd106f36d69a0754acf9f0b019db49d7188f1b8fd8e2fa4eccdb086beb23e0d4d74527653c38d251c4a2bd4fb4419062f3604b055f16d2260246d349590e110f5d3d64624e5496355d7f896761a5559df33117d580ba8403d8d16cd554a5eb7334af340a9e5090e9e6694e86c7d9b318fb9c5950a74ed4cbcb77cb88ec9edf8b1ab63f6b64a13dcf719eace2a2abde1ed1cd3d37579ba32ff3a340fa95ec528d93bd", 16),
     "d": parseBigInt("66a7270e10c547f9f991a717705c02723214b33d5393e5a8374321c475934b306b42ce2991d9ef5d30f63f8abcdb43c93e1762ddcd9eb0189db3464bdddbff310cdcfea416f0dcc9bf9c79df419bd526cfbf47c77d5ba0adbd1c02f58e38156ed5d1f1318e6b50abe7438dfc673f33331c8eec3aaa46ae8f1cce86a758cdb3f69509db0eb405bb7eba3e8ce6ea0036acf4c4f6e7596542dcbc880b469fb82ba56b15b70c1f1de6f7259b07465e4ff9016b2efe67d44e5a9d35fe05009903aa81", 16)};
    kulloAPI.private_key = private_key;
    kulloAPI.public_key = public_key;
    // AES keys can be random.
    kulloAPI.generate_aes_keys();
    
    ui_show_home();
    https://kullo.net:3546//users/:davidn!kullo.net/letters
    // Bind submit event for login form.
    $("#login-form").submit(function() {
        console.log("Logging in...");
        // Frease login form.
        $("#login-form button, #login-form input").attr("disabled", "disabled");
        // Submit login.
        client.login($(this).find(".address").val(),$(this).find(".password").val());
        // Prevent form to be submitted.
        return false;
    });

    // Logout.
    $("#nav-logout a").click(function() {
        console.log("Logging out...");
        // Frease logout button.
        $("#nav-logout").attr("disabled", "disabled");
        // Submit logout.
        client.logout();
        // Prevent form to be submitted.
        return false;
    });

    // Bind submit event for compose form.
    $("#compose-form").submit(function() {
        console.log("Sending message...");
        // Submit login.
        client.send($(this).find(".recipient").val(),$(this).find(".message").val());
        // Prevent form to be submitted.
        return false;
    });

    // Home.
    $("#nav-home a, #nav-brand").click(function() {
        ui_show_home();
        return false;
    });

    // Inbox.
    $("#nav-inbox a").click(function() {
        ui_show_inbox();
        return false;
    });
    // Inbox.
    $("#nav-generate a").click(function() {
        ui_show_generate();
        return false;
    });
    // Compose.
    $("#nav-compose a").click(function() {
        ui_show_compose();
        return false;
    });
    $("#compose-form .cancel").click(function() {
        ui_show_home();
        return false;
    });
    
    // Inbox visualization.
    $("#inbox").on("click", "li", function(){
        $(this).find("div.container").toggle();
    });
});


