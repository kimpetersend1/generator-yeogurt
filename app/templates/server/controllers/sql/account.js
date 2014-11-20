/**
 * Main Controller
 */

'use strict';

var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');<% if (dbOption === 'mongodb') { %>
var User = require('mongoose').model('user');<% } else if (dbOption === 'mysql') { %>
var db = require('../config/database');
var User = db.user;<% } %>
var secrets = require('../config/secrets');
var auth = require('../auth');<% if (!singlePageApplication) { %>

/**
 * GET /login
 * Login page.
 */

var login = function(req, res) {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/login', {
        title: 'Login'
    });
};<% } %>

/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
 */

var postLogin = function(req, res, next) {

    // Check to see if data is email or username
    var context = (req.body.username.indexOf('@') > -1) ? 'email' : 'username';

    if (context === 'email') {
        req.assert('username', 'Please enter a valid email address.').isEmail();
    }
    else {
        req.assert('username', 'Username cannot be blank').notEmpty();
    }

    // Run validation
    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        return res.json(400, errors);
    }

    // Authenticate using local strategy
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json(404, {
                message: 'Something went wrong, please try again.'
            });
        }
        // Send user authentication token
        auth.setTokenCookie(req, res);
    })(req, res, next);<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    // Authenticate using local strategy
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('errors', {
                msg: info.message
            });
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            req.flash('success', {
                msg: 'Success! You are logged in.'
            });
            res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);<% } %>
};<% if (!singlePageApplication) { %>

/**
 * GET /logout
 * Log out.
 */

var logout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */

var signup = function(req, res) {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/signup', {
        title: 'Create Account'
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */

var reset = function(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    // Find user with assigned reset token
    User.find({
        where: {
            resetPasswordToken: req.params.token,
            // Make sure token hasn't expired
            resetPasswordExpires: {gt: Date.now()}
        }
    }).success(function(user) {
        if (!user) {
            req.flash('errors', {
                msg: 'Password reset token is invalid or has expired.'
            });
            return res.redirect('/forgot');
        }
        res.render('account/reset', {
            title: 'Password Reset'
        });
    }).error(function(err) {
        if (err) {
            return next(err);
        }
    });
};<% } %>

/**
 * POST /reset/:token
 * Process the reset password request.
 * @param token
 */

var postReset = function(req, res, next) {
    req.assert('password', 'Password must be at least 6 characters long.').len(6);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    // Run validation
    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        return res.json(400, errors);
    }

    // Run asnyc operations in a synchronous fashion
    async.waterfall([
        function(done) {
            // Find user with assigned reset token
            User.find({
                where: {
                    resetPasswordToken: req.params.token,
                    // Make sure token hasn't expired
                    resetPasswordExpires: {gt: Date.now()}
                }
            }).success(function(user) {
                if (!user) {
                    return res.json(400, {
                        errors: [{
                            msg: 'Password reset token is invalid or has expired.'
                        }]
                    });
                }

                user.password = req.body.password;

                // Delete token
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;

                // Save new password
                user.save().success(function() {
                done(null);
                }).error(function(err) {
                    if (err) {
                        return next(err);
                    }
                });
            }).error(function(err) {
                if (err) {
                    return next(err);
                }
            });
        },
        function(user, done) {
            // Setup email transport
            var transporter = nodemailer.createTransport();
            // Create email message
            var mailOptions = {
                to: user.email,
                from: 'yeogurt@yoururl.com',
                subject: 'Your Yeogurt password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            // Send email
            transporter.sendMail(mailOptions, function(err) {
                // Send user authentication token
                auth.setTokenCookie(req, res);
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
    });<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    // Run asnyc operations in a synchronous fashion
    async.waterfall([
        function(done) {
            // Find user with assigned reset token
            User.find({
                where: {
                    resetPasswordToken: req.params.token,
                    // Make sure token hasn't expired
                    resetPasswordExpires: {gt: Date.now()}
                }
            }).success(function(user) {
                if (!user) {
                    req.flash('errors', {
                        msg: 'Password reset token is invalid or has expired.'
                    });
                    return res.redirect('back');
                }

                user.password = req.body.password;

                // Delete token
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;

                // Save new password
                user.save().success(function() {
                    // Login user
                    req.logIn(user, function(err) {
                        if (err) {
                            return done(err);
                        }
                        done(null, user);
                    });
                }).error(function(err) {
                    if (err) {
                        return next(err);
                    }
                });
            }).error(function(err) {
                if (err) {
                    return next(err);
                }
            });
        },
        function(user, done) {
            // Setup email transport
            var transporter = nodemailer.createTransport();
            // Create email message
            var mailOptions = {
                to: user.email,
                from: 'yeogurt@yoururl.com',
                subject: 'Your Yeogurt password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            // Send email
            transporter.sendMail(mailOptions, function(err) {
                req.flash('success', {
                    msg: 'Success! Your password has been changed.'
                });
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};<% if (!singlePageApplication) { %>

/**
 * GET /forgot
 * Forgot Password page.
 */

var forgot = function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('account/forgot', {
        title: 'Forgot Password'
    });
};<% } %>

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 * @param email/username
 */

var postForgot = function(req, res, next) {

    // Check to see if data is email or username
    var context = (req.body.username.indexOf('@') > -1) ? 'email' : 'username';

    if (context === 'email') {
        req.assert('username', 'Please enter a valid email address.').isEmail();
    }
    else {
        req.assert('username', 'Username cannot be blank').notEmpty();
    }

    // Run validation
    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        return res.json(400, errors);
    }

    // Run asnyc operations in a synchronous fashion
    async.waterfall([
        function(done) {
            // Create token
            crypto.randomBytes(16, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            // Check to see whether to search for email or username
            var searchInput = (context === 'email') ? {email: req.body.username.toLowerCase()} : {username: req.body.username.toLowerCase()};
            User.find({
                where: searchInput
            }).success(function(user) {
                if (!user) {
                    res.json(404, {
                        errors: [{
                            msg: 'No account with that email address exists.'
                        }]
                    });
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                // Save token to user account
                user.save().success(function() {
                    done(null, token, user);
                });
            }).error(function(err) {
                if (err) {
                    return next(err);
                }
            });
        },
        function(token, user, done) {
            // Setup email transport
            var transporter = nodemailer.createTransport();
            // Create email message
            var mailOptions = {
                to: user.email,
                from: 'yeogurt@yoururl.com',
                subject: 'Reset your password on Yeogurt',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            // Send email
            transporter.sendMail(mailOptions, function(err) {
                res.json(200, {
                    info: [{
                        msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
                    }]
                });
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
        res.json(301, {
            path: '/forgot'
        });
    });<% } else { %>

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    // Run asnyc operations in a synchronous fashion
    async.waterfall([
        function(done) {
            // Create token
            crypto.randomBytes(16, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            // Check to see whether to search for email or username
            var searchInput = (context === 'email') ? {email: req.body.username.toLowerCase()} : {username: req.body.username.toLowerCase()};
            User.find({
                where: searchInput
            }).success(function(user) {
                if (!user) {
                    req.flash('errors', {
                        msg: 'No account with that email address exists.'
                    });
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                // Save token to user account
                user.save().success(function() {
                    done(null, token, user);
                });
            }).error(function(err) {
                if (err) {
                    return next(err);
                }
            });
        },
        function(token, user, done) {
            // Setup email transport
            var transporter = nodemailer.createTransport();
            // Create email message
            var mailOptions = {
                to: user.email,
                from: 'yeogurt@yoururl.com',
                subject: 'Reset your password on Yeogurt',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            // Send email
            transporter.sendMail(mailOptions, function(err) {
                req.flash('info', {
                    msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
                });
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/forgot');
    });<% } %>
};

/**
 * GET /auth/:provider/callback
 * Link OAuth provider or request more information
 */

var linkOAuth = function(req, res, next) {<% if (singlePageApplication) { %>
    if (!req.newUser) {
        res.json(301, {
            path: '/'
        })
    }
    else {
        res.json(301, {
            path: '/social/signup',
            newUser: req.user
        })
    }<% } else { %>
    if (!req.newUser) {
        res.redirect('/');
    }
    else {
        // perserve user data through redirect
        req.session.newUser = req.user;
        res.redirect('/social/signup');
    }<% } %>
};<% if (!singlePageApplication) { %>

/**
 * GET /social/signup
 * Form to gather username and email to complete social account registration
 */

var socialSignup = function(req, res, next) {
    res.render('account/social-signup', {
        newUser: req.session.newUser
    });
    // Cleanup session data
    req.session.newUser = null;
};<% } %>

/**
 * POST /social/signup
 * Link OAuth provider and create new account
 * @param email
 * @param username
 */

var postSocialSignup = function(req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.assert('username', 'Username cannot be blank').notEmpty();

    // Run validation
    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        res.json(400, {
            errors: errors
        });
    }
    // Check to see if email account already exists
    User.find({
        where: {
            email: req.body.email
        }
    }).success(function(existingEmail) {
        // If there is an existing email account, return an error message
        if (existingEmail) {
            res.json(409, {
                errors: [{
                    msg: 'There is already an account using this email address.'
                }]
            });
        }
        else {
            // Check to see if username already exists
            User.find({
                where: {
                    username: req.body.username
                }
            }).success(function(existingUsername) {
                // If there is an existing username account, return an error message
                if (existingUsername) {
                    res.json(409, {
                        errors: [{
                            msg: 'There is already an account using this username.'
                        }]
                    });
                // Otherwise create new user account
                } else {
                    var user = {};

                    user.username = req.body.username;
                    user.email = req.body.email;
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.location = req.body.location;
                    user.picture = req.body.picture;
                    user.gender = req.body.gender;

                    if (req.body.facebook) {
                        user.facebook = req.body.facebook;
                        user.facebookToken = req.body.facebookToken;
                    }
                    else if (req.body.twitter) {
                        user.twitter = req.body.twitter;
                        user.twitterToken = req.body.twitterToken;
                        user.twitterSecret = req.body.twitterSecret;
                    }

                    // Save new user
                    User.build(user).save().success(function(user) {
                        // Send user authentication token
                        auth.setTokenCookie(req, res);
                    }).error(function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                }
            });
        }
    }).error(function(err) {
        if (err) {
            return next(err);
        }
    });<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/social/signup');
    }
    // Check to see if email account already exists
    User.find({
        where: {
            email: req.body.email
        }
    }).success(function(existingEmail) {
        // If there is an existing email account, return an error message
        if (existingEmail) {
            req.flash('errors', {
                msg: 'There is already an account using this email address.'
            });
        }
        else {
            // Check to see if username already exists
            User.find({
                where: {
                    username: req.body.username
                }
            }).success(function(existingUsername) {
                // If there is an existing username account, return an error message
                if (existingUsername) {
                    req.flash('errors', {
                        msg: 'There is already an account using this username.'
                    });
                // Otherwise create new user account
                } else {
                    var user = {};

                    user.username = req.body.username;
                    user.email = req.body.email;
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.location = req.body.location;
                    user.picture = req.body.picture;
                    user.gender = req.body.gender;

                    if (req.body.facebook) {
                        user.facebook = req.body.facebook;
                        user.facebookToken = req.body.facebookToken;
                    }
                    else if (req.body.twitter) {
                        user.twitter = req.body.twitter;
                        user.twitterToken = req.body.twitterToken;
                        user.twitterSecret = req.body.twitterSecret;
                    }

                    // Save new user
                    User.build(user).save().success(function(user) {
                        // Login new user
                        req.logIn(user, function(err) {
                            if (err) {
                                req.flash('errors', {
                                    msg: 'Error logging in, please try signing up again.'
                                });
                            }
                            res.redirect('/');
                        });
                    }).error(function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                }
            });
        }
    }).error(function(err) {
        if (err) {
            return next(err);
        }
    });<% } %>
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 * @param provider
 */

var unlinkOAuth = function(req, res, next) {
    var provider = req.params.provider;
    User.find({
        where: {
            username: req.user.username
        }
    }).success(function(user) {
        // Remove provider token
        user[provider] = null;
        user[provider + 'Token'] = null;
        if (user[provider + 'Secret']) {
            user[provider + 'Secret'] = null;
        }

        user.save().success(function() {<% if (singlePageApplication) { %>
            res.json(301, {
                path: '/user/' + req.user.username,
                info: [{
                    msg: provider + ' account has been unlinked.'
                }]
            });<% } else { %>
            req.flash('info', {
                msg: provider + ' account has been unlinked.'
            });
            res.redirect('/user/' + req.user.username);<% } %>
        }).error(function(err) {
            if (err) {
                return next(err);
            }
        });
    }).error(function(err) {
        if (err) {
            return next(err);
        }
    });
};

/**
 * GET /settings
 * Settings page.
 */

var settings = function(req, res) {<% if (singlePageApplication) { %>
    res.json(req.user);<% } else { %>
    res.render('account/settings', {
        title: 'Account Management'
    });<% } %>
};

module.exports = {
    login: login,
    postLogin: postLogin,
    logout: logout,
    signup: signup,
    socialSignup: socialSignup,
    postSocialSignup: postSocialSignup,
    reset: reset,
    postReset: postReset,
    forgot: forgot,
    postForgot: postForgot,
    linkOAuth: linkOAuth,
    unlinkOAuth: unlinkOAuth,
    settings: settings
};