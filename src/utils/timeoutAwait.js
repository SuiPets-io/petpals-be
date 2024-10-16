const timeoutAwait = (s) => {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

module.exports = timeoutAwait;
