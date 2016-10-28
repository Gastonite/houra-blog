const Jade = require('jade');
const Wreck = require('wreck');
const Houra = require('houra');

module.exports = step => {

  const register = (server, options, next) => {

    server.views({
      engines: {jade: Jade},
      path: Houra.path('templates'),
      compileOptions: {
        pretty: true
      }
    });


    server.route([
      {
        method: 'GET',
        path: '/',
        config: {
          auth: {
            mode: 'try'
          },
          // handler: function (request, reply) {
          //
          //   reply(request.auth.isAuthenticated)
          // }
          handler: {
            proxy: {
              uri: 'http://localhost:8081/post',
              onResponse: function (err, res, request, reply, settings, ttl) {

                Wreck.read(res, { json: true }, function (err, posts) {

                  let user;

                  if (request.auth.credentials) {
                    user = Object.assign({}, request.auth.credentials);

                    delete user.password;
                  }

                  reply.view('home', {posts, user});
                });
              }
            }
          }
          // handler: function (request, reply) {
          //   const posts = [];
          //
          //   // if (!request.auth.isAuthenticated) {
          //   //   return reply.view('home', {posts: []});
          //   // }
          //   //
          //   return server.inject('/post').then(posts => {
          //
          //     // Wreck.read(posts.raw.res, {json: true}, function (err, payload) {
          //     //
          //     //   reply(payload).headers = posts.raw.res.headers;
          //     // });
          //
          //     // return posts
          //   });
          //   // reply(posts2);
          //
          //   reply.proxy({ host: 'localhost', port: 8081, protocol: 'http' });
          //
          // }
        },
      },
      {
        method: 'POST',
        path: '/post',
        config: {
          handler: {
            proxy: {
              host: 'localhost',
              port: 8081,
              protocol: 'http'
            }
          }
        }
      }
    ]);

    next();
  };

  register.attributes = {
    name: 'views'
  };

  return {
    register
  };
};