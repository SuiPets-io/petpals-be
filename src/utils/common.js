const commonUtils = module.exports;

commonUtils.getRandom = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

commonUtils.randomFixedLengthNumber = (length) => {
  var add = 1,
    max = 12 - add;

  if (length > max) {
    return generate(max) + generate(length - max);
  }

  max = Math.pow(10, length + add);
  var min = max / 10;
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ('' + number).substring(add);
};
