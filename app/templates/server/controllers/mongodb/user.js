/**
 * Main Controller
 */

'use strict';

var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('mongoose').model('user');
var secrets = require('../config/secrets');
var auth = require('../auth');

/**
 * GET /user/:username
 * Profile page.
 * @param username
 */

var show = function(req, res, next) {
    // Find user information
    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        if (user) {<% if (singlePageApplication) { %>
            if (user) {
                res.json(user);
            }<% } else { %>
            res.render('account/profile', {
                title: 'Profile',
                publicInfo: user
            });
            <% } %>
        }
        else {
            // Will allow route to continue leading to 404 error
            next();
        }
    });
};

/**
 * POST /user
 * Create a new local account.
 * @param username
 * @param email
 * @param password
 * @param confirmPassword
 */

var create = function(req, res, next) {
    req.assert('username', 'Username cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 6 characters long').len(6);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        res.json({
            errors: errors
        });
    }

    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({
        username: req.body.username
    }, function(err, existingUser) {
        if (err) {
            return next(err);
        }
        if (existingUser) {
            res.json({
                errors: [{
                    param: 'email',
                    msg: 'Account with that email address already exists.'
                }]
            });
        }
        user.save(function(err) {
            if (err) {
                return next(err);
            }
            var token = auth.signToken(user.username, user.role);
            res.json({
                token: token,
                success: [{
                    msg: 'Account created successfully.'
                }]
            });
        });
    });<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({
        username: req.body.username
    }, function(err, existingUser) {
        if (existingUser) {
            req.flash('errors', {
                msg: 'Account with that username already exists.'
            });
            return res.redirect('/signup');
        }
        user.save(function(err) {
            if (err) {
                return next(err);
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', {
                    msg: 'Account created successfully.'
                });
                res.redirect('/');
            });
        });
    });<% } %>
};

/**
 * PUT /user/:username/username
 * Update username.
 */

var updateUsername = function(req, res, next) {
    req.assert('username', 'Username cannot be blank').notEmpty();

    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        res.json({
            errors: errors
        });
    }

    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        User.findOne({
            username: req.body.username
        }, function(err, existingUser) {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                return res.json({
                    errors: [{
                        param: 'username',
                        msg: 'Account with that username already exists.'
                    }]
                });
            }

            user.username = req.body.username;

            user.save(function(err) {
                if (err) {
                    return next(err);
                }
                res.json({
                    success: [{
                        msg: 'Username information updated.'
                    }]
                });
            });
        });
    });<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/settings');
    }
    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        User.findOne({
            username: req.body.username
        }, function(err, existingUser) {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                req.flash('errors', {
                    msg: 'Account with that username already exists.'
                });
                return res.redirect('/settings');
            }

            user.username = req.body.username;

            user.save(function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', {
                    msg: 'Username information updated.'
                });
                res.redirect('/settings');
            });
        });
    });<% } %>
};

/**
 * PUT /user/:username/profile
 * Update profile information.
 */

var updateProfile = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();

    var errors = req.validationErrors();<% if (singlePageApplication) { %>

    if (errors) {
        res.json({
            errors: errors
        });
    }

    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        user.email = req.body.email || '';
        user.firstName = req.body.firstName || '';
        user.lastName = req.body.lastName || '';
        user.gender = req.body.gender || '';
        user.location = req.body.location || '';
        user.website = req.body.website || '';

        user.save(function(err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: [{
                    msg: 'Profile information updated.'
                }]
            });
        });
    });<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/settings');
    }

    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        user.email = req.body.email || '';
        user.firstName = req.body.firstName || '';
        user.lastName = req.body.lastName || '';
        user.gender = req.body.gender || '';
        user.location = req.body.location || '';
        user.website = req.body.website || '';

        user.save(function(err) {
            if (err) {
                return next(err);
            }
            req.flash('success', {
                msg: 'Profile information updated.'
            });
            res.redirect('/settings');
        });
    });<% } %>
};

/**
 * PUT /user/:username/password
 * Update current password.
 * @param password
 * @param confirmPassword
 */

var updatePassword = function(req, res, next) {
    req.assert('password', 'Password must be at least 6 characters long').len(6);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();<% if (singlePageApplication) { %>
    if (errors) {
        res.json({
            errors: errors
        });
    }

    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        user.password = req.body.password;

        user.save(function(err) {
            if (err) {
                return next(err);
            }
            res.json({
                success: [{
                    msg: 'Password has been changed.'
                }]
            });
        });
    });<% } else { %>
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/settings');
    }

    User.findOne({
        username: req.params.username
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        user.password = req.body.password;

        user.save(function(err) {
            if (err) {
                return next(err);
            }
            req.flash('success', {
                msg: 'Password has been changed.'
            });
            res.redirect('/settings');
        });
    });<% } %>
};

/**
 * DELETE /user/:username
 * Delete user account.
 * @param username
 */

var destroy = function(req, res, next) {<% if (singlePageApplication) { %>
    User.remove({
        username: req.params.username
    }, function(err) {
        if (err) {
            return next(err);
        }
        res.json({
            info: [{
                msg: 'Account with username "' + req.params.username + '" has been deleted.'
            }]
        });
    });<% } else { %>
    User.remove({
        username: req.params.username
    }, function(err) {
        if (err) {
            return next(err);
        }
        req.logout();
        req.flash('info', {
            msg: 'Account with username "' + req.params.username + '" has been deleted.'
        });
        res.redirect('/');
    });<% } %>
};

/**
 * DELETE /user
 * Delete current user account.
 */

var deleteAccount = function(req, res, next) {<% if (singlePageApplication) { %>
    User.remove({
        _id: req.user.id
    }, function(err) {
        if (err) {
            return next(err);
        }
        res.json({
            info: [{
                msg: 'Your account has been deleted.'
            }]
        });
    });<% } else { %>
    User.remove({
        _id: req.user.id
    }, function(err) {
        if (err) {
            return next(err);
        }
        req.logout();
        req.flash('info', {
            msg: 'Your account has been deleted.'
        });
        res.redirect('/');
    });<% } %>
};

module.exports = {
    show: show,
    create: create,
    updateUsername: updateUsername,
    updateProfile: updateProfile,
    updatePassword: updatePassword,
    destroy: destroy,
    deleteAccount: deleteAccount
};