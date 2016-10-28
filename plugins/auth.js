const Houra = require('houra');
const Jade = require('jade');

module.exports = ({bag, path}) => {


  const register = (server, options, next) => {

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', true, {
      password: 'password-should-be-32-characters',
      cookie: 'sid',
      redirectTo: '/signin',
      isSecure: false,
      redirectOnTry: false,
      clearInvalid: true,
      ttl: 365 * 24 * 60 * 60 * 1000,
      validateFunc: function (request, session, callback) {

        cache.get(session.sid, (err, cached) => {

          if (err) {
            return callback(err, false);
          }

          if (!cached) {
            return callback(null, false);
          }

          return callback(null, true, cached.account);
        });
      }
    });

    let uuid = 1;       // Use seq instead of proper unique identifiers for demo only

    const users = {
      john: {
        id: 'john',
        password: 'p',
        name: 'John Doe'
      }
    };

    const signIn = function (request, reply) {

      if (request.auth.isAuthenticated) {
        return reply.redirect('/');
      }

      let message = '';
      let account = null;

      if (request.method === 'post') {

        if (!request.payload.username || !request.payload.password) {

          message = 'Missing username or password';

        } else {

          account = users[request.payload.username];
          if (!account || account.password !== request.payload.password) {

            message = 'Invalid username or password';
          }
        }
      }

      if (request.method === 'get' || message) {

        return reply('<html><head><title>Login page</title></head><body><h3>Sign in</h3>' +
          (message ? '<strong>' + message + '</strong><br/>' : '') +
          '<form method="post">' +
          'Username: <input type="text" name="username"><br>' +
          'Password: <input type="password" name="password"><br/>' +
          '<input type="submit" value="Login"></form></body></html>');
      }

      const sid = String(++uuid);
      request.server.app.cache.set(sid, { account: account }, 0, (err) => {

        if (err) {
          reply(err);
        }

        request.cookieAuth.set({ sid: sid });
        return reply.redirect('/');
      });
    };

    const signOut = function (request, reply) {

      request.cookieAuth.clear();
      return reply.redirect('/');
    };



    server.route([
      {
        method: ['GET', 'POST'],
        path: '/signin',
        config: {
          handler: signIn,
          auth: {
            mode: 'try'
          }
        }
      },
      {
        method: 'GET',
        path: '/signout',
        config: {
          handler: signOut
        }
      }
    ]);

    next();
  };

  register.attributes = {
    name: 'auth'
  };

  return {
    register
  };

};