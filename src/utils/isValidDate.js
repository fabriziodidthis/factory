/**
 * @description Uma vez que o Chrome adiciona 000... em strings, esta verificao permite
 * eliminar falso positivo - https://stackoverflow.com/a/60632561
 * @param {*} date
 * @returns Se data informada é válida ou não
 */
const isValidDate = date => {
  const trimSpaces = date.replace(/\s/g, '');
  if (trimSpaces.length < 3) {
    return false;
  }
  return Date.parse(trimSpaces) > 0;
};

module.exports = {
  isValidDate,
};
