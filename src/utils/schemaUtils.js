const Joi = require('joi');

const customJoi = Joi.extend((joi) => ({
  type: 'array',
  base: joi.array(),
  coerce: (value, state, options) => ({
    value: value.split ? value.split(',') : value,
  }),
}));

module.exports = {
  customJoi,
};
