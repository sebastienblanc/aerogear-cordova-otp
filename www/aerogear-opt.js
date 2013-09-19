(function (window, undefined) {
    this.AeroGear = {};
    AeroGear.Totp = function (secret) {
        this.secret = secret;
        return this;
    }

    AeroGear.Totp.constructor = AeroGear.Totp;

    /**
     * Generate a one time password based on provided secret.
     * @param callback the callback to execute when the generation is done
     * @example
     *
     *  // the secret key (statically defined here but in practice it's scanned)
     *  String secret = "B2374TNIQ3HKC446";
     *  // initialize OTP
     *  var generator = new AeroGear.Totp(secret);
     *  // generate token
     *  generator.generateOTP(function(result) { ... });
     */
    AeroGear.Totp.prototype.generateOTP = function (callback) {
        cordova.exec(callback, null, "AeroGearPlugin", "generateOTP", [this.secret]);
    }

    /**
     * Scan a QR code that contains a url with the secret as a parameter
     * @param callback called on success with the result
     */
    AeroGear.Totp.prototype.scanSecret = function (callback) {
        cordova.plugins.barcodeScanner.scan(function(result) {
            if (!result.cancelled) {
                var secret = gup(result.text, 'secret');
                callback(secret);
            }
        });
    }

    /**
     * Store the secret so we can use it later
     * @param secret the secret to store
     */
    AeroGear.Totp.prototype.storeSecret = function (secret) {
        cordova.exec(null, null, "AeroGearPlugin", "storeSecret", [secret]);
    }

    /**
     * Read an existing secret
     * @param callback called when the secret is retrieved with the secret or null when there was none
     */
    AeroGear.Totp.prototype.readSecret = function (callback) {
        cordova.exec(callback, null, "AeroGearPlugin", "readSecret", []);
    }

    /**
     * Combined method for all of the above, will start scanning when there is no secret
     * and stores the secret afterwards. If there already is a secret stored it will generate a OTP based on
     * the secret that was stored.
     *
     * @param callback called with the one time password
     * @example
     *
     * var totp = new AeroGear.Totp();
     * totp.generate(function(result) { ... });
     */
    AeroGear.Totp.prototype.generate = function (callback) {
        var build = function(secret) {
            new AeroGear.Totp(secret).generateOTP(function(otp) {
                callback(otp);
            });
        }
        this.readSecret(function(result) {
            if (result != null) {
                build(result);
            } else {
                new AeroGear.Totp().scanSecret(function(secret) {
                    new AeroGear.Totp().storeSecret(secret);
                    build(secret);
                });
            }
        });
    }

    function gup(url, name) {
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results != null ? results[1] : "";
    }
})( this );
