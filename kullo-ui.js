function KulloUI() {
    // Class members.
    this.server = "https://dev.kullo.net:3546/"; // @todo: Don't hardcode this.
    this.sid = null;
    this.user = null;
    this.kullo = null;
    this.loading_counter = 0;
    this.overlay = null;
    
    /**
     * Initializes the UI. Should be called after DOM is ready!
     */
    this.init = function() {
        // Create a new Kullo instance.
        this.kullo = new Kullo();
        // Example data.
        // @todo: Should be removed at some point.
        var public_key = {
          "N": parseBigInt("9690c1ba8939eda38966578738baa7ff79d5a7f08bfcb4faedd58a2dc332cd106f36d69a0754acf9f0b019db49d7188f1b8fd8e2fa4eccdb086beb23e0d4d74527653c38d251c4a2bd4fb4419062f3604b055f16d2260246d349590e110f5d3d64624e5496355d7f896761a5559df33117d580ba8403d8d16cd554a5eb7334af340a9e5090e9e6694e86c7d9b318fb9c5950a74ed4cbcb77cb88ec9edf8b1ab63f6b64a13dcf719eace2a2abde1ed1cd3d37579ba32ff3a340fa95ec528d93bd", 16),
          "e": 65537
        };
        var private_key = {
          "N": parseBigInt("9690c1ba8939eda38966578738baa7ff79d5a7f08bfcb4faedd58a2dc332cd106f36d69a0754acf9f0b019db49d7188f1b8fd8e2fa4eccdb086beb23e0d4d74527653c38d251c4a2bd4fb4419062f3604b055f16d2260246d349590e110f5d3d64624e5496355d7f896761a5559df33117d580ba8403d8d16cd554a5eb7334af340a9e5090e9e6694e86c7d9b318fb9c5950a74ed4cbcb77cb88ec9edf8b1ab63f6b64a13dcf719eace2a2abde1ed1cd3d37579ba32ff3a340fa95ec528d93bd", 16),
          "d": parseBigInt("66a7270e10c547f9f991a717705c02723214b33d5393e5a8374321c475934b306b42ce2991d9ef5d30f63f8abcdb43c93e1762ddcd9eb0189db3464bdddbff310cdcfea416f0dcc9bf9c79df419bd526cfbf47c77d5ba0adbd1c02f58e38156ed5d1f1318e6b50abe7438dfc673f33331c8eec3aaa46ae8f1cce86a758cdb3f69509db0eb405bb7eba3e8ce6ea0036acf4c4f6e7596542dcbc880b469fb82ba56b15b70c1f1de6f7259b07465e4ff9016b2efe67d44e5a9d35fe05009903aa81", 16)
        };
        
        this.kullo.private_key = private_key;
        this.kullo.public_key = public_key;
        // AES keys can be random.
        this.kullo.generate_aes_keys();
        
        // Make this in callback available.
        that = this;
        
        // Bind events to forms.
        $("#login-form").submit(function() {
            that.login($(this).find(".address").val(),$(this).find(".password").val());
            return false; // Prevent form to be submitted.
        });
        $("#compose-form").submit(function() {
            that.send_message($(this).find(".recipient").val(),$(this).find(".message").val());
            return false; // Prevent form to be submitted.
        });
        
        // Bind events to buttons and links.
        $("#nav-logout a").click(function() {
            that.logout();
            // Prevent form to be submitted.
            return false;
        });
        $("#nav-home a").click(function() {
            that.show_page('home');
            return false;
        });
        $("#nav-inbox a").click(function() {
            that.show_page('inbox');
            return false;
        });
        $("#nav-compose a").click(function() {
            that.show_page('compose');
            return false;
        });
        $("#inbox").on("click", "li", function(){
            $(this).find("div.container").toggle();
            return false;
        });
        $("#nav-generate a").click(function() {
            $("#nav-generate").addClass("active");
            that.loading_started();
            that.kullo.generate_rsa_keys();
            that.kullo.generate_aes_keys();
            that.loading_finished();
            $("#nav-generate").removeClass("active");
            return false;
        });
        
        // Show homepage.
        this.show_page('home');
        
        // Ajax loading modal.
        $("body").on({
            ajaxStart: function() { 
                that.loading_started();
            },
            ajaxStop: function() { 
                that.loading_finished();
            }    
        });
    };
    
    /**
     * Show that the page is loading.
     */
    this.loading_started = function() {
        this.loading_counter++;
        //  ItpOverlay must be loaded.
        if (typeof ItpOverlay=='undefined') return;
        if (!this.overlay) this.overlay = new ItpOverlay("body");
        this.overlay.show();
    };
    
    /**
     * Stop showing that the page is loading.
     */
    this.loading_finished = function() {
        this.loading_counter--;
        // ItpOverlay must be loaded.
        if (typeof ItpOverlay=='undefined') return;
        if (this.loading_counter <= 0) {
            this.overlay.hide();
            this.loading_counter = 0; // Just to avoid problems...
        }
    };
    
    
    /**
     * Loads a page.
     * 
     * @param {String} page The page to load: home/compose/inbox
     */
    this.show_page = function(page) {
        $(".nav li").removeClass("active");
        $(".page:not(#page-" + page + ")").fadeOut('fast');
        // Fade in after fadeout is complete.
        // @see: http://api.jquery.com/promise/#example-1
        $(".page:not(#page-" + page + ")").promise().done(function() {
            $("#page-" + page).fadeIn('fast');
        });
        $("#nav-" + page).addClass("active");
        
        // Perform certain actions:
        if (page == 'inbox') {
            that.load_inbox();
        }
    };
    
    /**
     * Reloads page after successful login.
     * 
     * @param {String} page The page to load: home/compose/inbox
     */
    this.logged_in = function(page) {
        $("#login-form").fadeOut();
        $("#nav-logout").fadeIn();
        $("#nav-compose").fadeIn();
        $("#nav-inbox").fadeIn();
        $("#nav-generate").fadeIn();
        this.show_page(page);
    };
    
    /**
     * Reloads page after successful logout.
     * 
     * @param {String} page The page to load: home/compose/inbox
     */
    this.logged_out = function(page) {
        $("#nav-logout").fadeOut();
        $("#nav-compose").fadeOut();
        $("#nav-inbox").fadeOut();
        $("#nav-generate").fadeOut();
        $("#login-form button, #login-form input").removeAttr("disabled");
        $("#login-form").fadeIn();
        this.show_page(page);
    };
    
    
    /**
     * Performas a login (POST on /sessions).
     */
    this.login = function(address, password) {
        console.log("Logging in...");
        // Frease login form.
        $("#login-form button, #login-form input").attr("disabled", "disabled");
        // Assamble request parameter.
        var payload = "<login><address>" + address + "</address><password>" + password + "</password></login>";
        var path = 'sessions';
        var method = 'POST';
        var that = this;
        $.ajax({
            url: this.server + path,
            data: payload,
            contentType: "application/xml",
            type: method,
            dataType: 'xml',
            timeout: 60000,
            cache: true
        }).done(function ( data ) {
            that.sid = null;
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
                        alert("The response contained invalid data");
                    }
                    else{
                        // Session successwfully created.
                        that.sid = sid;
                        that.user = address;
                        that.logged_in("home");
                        console.log("SID:", sid);
                    }
                }
                
            } catch(err) {
                console.log("The response contained invalid xml");
                alert("The response contained invalid xml");
            }
            // Release login form in either case.
            $("#login-form button, #login-form input").removeAttr("disabled");
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
            // Release login form.
            $("#login-form button, #login-form input").removeAttr("disabled");
        });
    };
    
    
    /**
     * Performas a logout (DELETE on /sessions).
     * 
     * @todo: Server is not supporting delete method yet!
     */
    this.logout = function() {
        // You can only log out if there is a session id.
        if (!this.sid) return;
        console.log("Logging out...");
        // Frease menu link.
        $("#nav-logout").attr("disabled", "disabled");
        // Assamble request parameter.
        var payload = "";
        var path = 'sessions/' + this.sid;
        var method = 'DELETE';
        // Delete local sid.
        this.sid = null;
        // Submit delete request.
        $.ajax({
            url: this.server + path,
            data: payload,
            contentType: "application/xml",
            type: method,
            dataType: 'xml',
            timeout: 60000,
            cache: true
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
        });
        // We are logged out locally even if the session could not be deleted.
        this.logged_out("home");
        // Release menu link.
        $("#nav-logout").removeAttr("disabled");
    };

    
    /**
     * Loads the inbox (GET on /users/:address/letters).
     */
    this.load_inbox = function() {
        console.log("Loadin Inbox...");
        // Assamble request parameter.
        var payload = "";
        var path = "users/" + this.user + "/letters";
        var method = 'GET';
        var that = this;
        $.ajax({
            url: this.server + path,
            data: payload,
            contentType: "application/xml",
            type: method,
            dataType: 'xml',
            timeout: 60000,
            cache: true
        }).done(function ( data ) {
            // Parse the response.
            try{
                var xml = $( data );
                var letterList = xml.find( "letterList" ).text();
                if (letterList) {
                    // Remove old inbox.
                    $("#inbox li").remove();
                    // Load messages.
                    $('letterList', xml).children('item').each(function() {
                        that.load_message($(this).text());
                    });
                }
                else {
                    console.log("Messages could not be loaded");
                    alert("Messages could not be loaded");
                }
            } catch(err) {
                console.log("The response contained invalid xml");
                alert("Messages could not be loaded");
            }
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
            alert("Messages could not be loadedl");
        });
    };

    
    /**
     * Loads a message (GET on /users/:address/letters/:messageid).
     */
    this.load_message = function(messageid) {
        console.log("Loadin Message...");
        // Assamble request parameter.
        var payload = "";
        var path = "users/" + this.user + "/letters/" + messageid;
        var method = 'GET';
        var that = this;
        $.ajax({
            url: this.server + path,
            data: payload,
            contentType: "application/xml",
            type: method,
            dataType: 'xml',
            timeout: 60000,
            cache: true
        }).done(function ( data ) {
            console.log('Data: ', data);
            var message = that.kullo.decomposeMessage(data);
            $("#inbox").append("<li class='well' style='display: block;'><div class='container decrypted' ><article>" + $(data).find("messageContainer").text() + "</div><div disabled='disabled' style='display: none; ' class='container encrypted'>" + message + "</div></li>");
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
            alert("Message could not be loadedl");
        });
    };

    
    /**
     * Send a message (POST on /users/:address/letters).
     */
    this.send_message = function(recipient, message) {
        console.log("Sending Message...");
        // Frease form.
        $("#compose-form button, #compose-form input, #compose-form textarea").attr("disabled", "disabled");
        // Assamble request parameter.
        var payload = this.kullo.composeMessage(recipient, message);
        var path = "users/" + this.user + "/letters";
        var method = 'POST';
        var that = this;
        $.ajax({
            url: this.server + path,
            data: payload,
            contentType: "application/xml",
            type: method,
            dataType: 'xml',
            timeout: 60000,
            cache: true
        }).done(function ( data ) {
            // Parse the response.
            try{
                var xml = $( data );
                var status = xml.find( "status" ).text();
                if (status != "error") {
                    alert("Sending successful");
                    $("#compose-form .message").val("");
                    that.show_page("inbox");
                }
                else {
                    console.log("Messages could not be loaded");
                    alert("Message could not be send");
                }
            } catch(err) {
                console.log("The response contained invalid xml");
                alert("Message could not be send");
            }
            // Release login form.
            $("#compose-form button, #compose-form input, #compose-form textarea").removeAttr("disabled");
        }).fail(function(jqXHR, textStatus) {
            console.log("An error occured: " + textStatus);
            alert("Message could not be sent");
            // Release login form.
            $("#compose-form button, #compose-form input, #compose-form textarea").removeAttr("disabled");
        });
    };
    
    
}

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};
    
    // Create Kullo and KulloUI instances.
    ui = new KulloUI();
    ui.init();
    
});