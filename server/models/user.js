"use strict"
const async = require('async')
    , debug = require('debug')('ms:profile');

module.exports = function (User) {
    var app;
    var Role, RoleMapping, Profile;
    User.on('attached', function (a) {
        app = a;
        Role = app.models.role;
        RoleMapping = app.models.RoleMapping;
        Profile = app.models.profile;
    });

    User.deleteUser = function (userId, done) {
        if (!userId) {
            return done(new Error('Bad request'));
        }
        async.waterfall([
            (callback) => {
                User.findOne({ where: { id: userId } }, callback)
            },
            (user, callback) => {
                if (user && user.profile) {
                    user.profile.destroy((err) => {
                        callback(err, user);
                    })
                } else {
                    callback(new Error("User not found"));
                }
            },
            (user, callback) => {
                user.destroy((err) => {
                    callback(err, user.id);
                })
            },
            (userId, callback) => {
                if (app.rabbit) {
                    app.rabbit.request('ex.cars', {
                        routingKey: "requests",
                        type: 'cars.delete.all',
                        body: userId
                    }).then((final) => {
                        debug("ALL BOUND CARS WAS DELETED: ", final.body);
                        callback(null, final.body);
                        final.ack();
                    }).catch((err) => {
                        callback(err);
                    });
                } else {
                    callback(new Error("Operation can't be completed, broker is not available"));
                }
            }], (err, result) => {
                return done(err, result);
            })
    };
    User.remoteMethod('deleteUser', {
        accepts: {
            arg: 'userId',
            type: 'string',
            http: (ctx) => {
                return ctx.req.get('X-PRINCIPLE');
            }
        },
        returns: { type: 'object', root: true },
        http: { path: '/deleteuserandprofile', verb: 'post', errorStatus: 400 }
    });

    User.updatePassword = function (userId, data, done) {
        if (!userId) {
            return done(new Error('Bad request'));
        }
        User.findOne({ where: { id: userId } }, (err, user) => {
            if (err || !user) return done(err || new Error("User not found"))
            user.hasPassword(data.oldPassword, (err, isMatch) => {
                if (err) return done(err);
                if (isMatch) {
                    user.updateAttributes({
                        password: data.newPassword
                    }, () => {
                        debug(`Password updated sucessfully for user: ${userId}`);
                        done();
                    })
                } else {
                    return done(new Error("Wrong password"))
                }
            })
        })
    };
    User.remoteMethod('updatePassword', {
        accepts: [
            {
                arg: 'userId',
                type: 'string',
                http: (ctx) => {
                    return ctx.req.get('X-PRINCIPLE');
                }
            }, {
                arg: 'data',
                type: 'object',
                http: (ctx) => {
                    return ctx.req.body;
                }
            }
        ],
        returns: { type: 'object', root: true },
        http: { path: '/updatePassword', verb: 'post', errorStatus: 400 }
    });

    User.updateAccount = function (userId, data, done) {
        if (!userId) {
            return done(new Error('Bad request'));
        }
        User.findOne({ where: { id: userId } }, (err, user) => {
            if (err || !user) return done(err || new Error("User not found"))
            user.updateAttributes({
                username: data.username,
                email: data.email
            }, () => {
                debug(`Account data updated sucessfully for user: ${userId}`);
                done();
            });
        })
    };
    User.remoteMethod('updateAccount', {
        accepts: [
            {
                arg: 'userId',
                type: 'string',
                http: (ctx) => {
                    return ctx.req.get('X-PRINCIPLE');
                }
            }, {
                arg: 'data',
                type: 'object',
                http: (ctx) => {
                    return ctx.req.body;
                }
            }
        ],
        returns: { type: 'object', root: true },
        http: { path: '/updateAccount', verb: 'post', errorStatus: 400 }
    });

    User.getUserByPrinciple = function (userId, done) {
        User.findOne({ where: { id: userId } }, (err, user) => {
            done(err, user);
        })
    };
    User.remoteMethod('getUserByPrinciple', {
        accepts: {
            arg: 'userId',
            type: 'string',
            http: (ctx) => {
                return ctx.req.get('X-PRINCIPLE');
            }
        },
        returns: { type: 'object', root: true },
        http: { path: '/getUser', verb: 'get', errorStatus: 400 }
    });

    User.signout = function (accessToken, clb) {
        if (!!accessToken) {
            User.logout(accessToken, (err, result) => {
                debug("User logout", accessToken)
                clb(err, 'ok');
            });
        } else {
            throw 'No token provided'
        }
    }
    User.remoteMethod('signout', {
        accepts: {
            arg: 'accessToken',
            type: 'string',
            http: (ctx) => {
                return ctx.req.body.accessToken;
            }
        },
        returns: { type: 'string', root: true },
        http: { path: '/signout', verb: 'post', errorStatus: 401 }
    })

    User.signup = function (data, clb) {
        debug("Creating new user", data.username)
        async.waterfall([
            (callback) => {
                User.create(data, callback)
            },
            (user, callback) => {
                Role.findOne({ where: { name: 'user' } }, (err, role) => {
                    callback(err, user, role)
                })
            },
            (user, role, callback) => {
                role.principals.create({
                    principalType: RoleMapping.USER,
                    principalId: user.id
                }, (err) => {
                    callback(err, user);
                });
            },
            (user, callback) => {
                user.profile.create({}, callback);
            },
        ], (err, profile) => {
            if (err) {
                if (err.name == 'ValidationError') {
                    clb(err.details)
                } else {
                    throw err;
                }
            } else {
                debug("User and profile created successfully", data.username)
                return clb(null, profile);
            }
        });
    };
    User.remoteMethod('signup', {
        accepts: {
            arg: 'data',
            type: 'object',
            http: (ctx) => {
                return ctx.req.body;
            }
        },
        returns: { type: 'object', root: true },
        http: { path: '/signup', verb: 'post', errorStatus: 400 }
    });

};
