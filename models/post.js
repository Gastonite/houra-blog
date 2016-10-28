const Joi = require('joi');
const Boom = require('boom');
const internals = {};


internals.Post = module.exports = {
  identity: 'post',
  connection: 'db',
  attributes: {
    title: {
      type: 'string',
      required: true
    },
    content: {
      type: 'string',
      required: true
    },
    published: {
      type: 'date',
      required: true
    }
  },
  beforeValidate: (values, done) => {


    if (!(values.published instanceof Date) && values.published) {

      values.published = parseInt(values.published);

      if (isNaN(values.published)) {
        return done(Boom.badRequest('"published" is not a timestamp'));
      }

      values.published = new Date(values.published * 1000);
    }
    done();
  }
};

