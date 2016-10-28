const Houra = require('houra');
const Jade = require('jade');

module.exports = ({bag, path}) => {


  const register = (server, options, next) => {

    server.route({
      method: 'GET',
      path: '/{path*}',
      handler: {
        directory: {
          listing: true,
          path: Houra.path('static'),
          redirectToSlash: true,
          index: true
        }
      }
    });

    next();
  };

  register.attributes = {
    name: 'static'
  };

  return {
    register
  };

};