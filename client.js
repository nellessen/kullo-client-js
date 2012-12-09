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
            cache: false
        }).done(function ( data ) {
            console.log("Response data:", data);
            if (typeof(success_callback) == "function") success_callback(data);
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
        });
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

            // Release login form.
            $("#login-form button, #login-form input").removeAttr("disabled");
        });
    };
    
}



// Initialize REST Client.
client = new KulloREST();

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};
    
    // UI functions.
    function ui_loggedin(){
        $("#login-form").fadeOut();
    }

    // Bin submit event to postMessage().
    $("#login-form").submit(function() {
        console.log("Logging in...");
        // Frease login form.
        $("#login-form button, #login-form input").attr("disabled", "disabled");
        // Submit login.
        client.login($(this).find(".address").val(),$(this).find(".password").val());
        // Prevent form to be submitted.
        return false;
    });
});


