const today = new Date();

/**
 * @description Funcao que retorna o status da aplicacao
 * @returns {Object} Retorna um objeto com o status da aplicacao
 */
const appHealth = async (request, response, next) => {
  const healthCheck = {
    uptimeInSeconds: `Servidor esta online ha ${Math.floor(
      process.uptime(),
    )} segundos`,
    uptimeDate: `Servidor esta ok desde ${today}`,
    message: 'OK',
    timestamp: today.toUTCString(),
  };

  try {
    response.json({ healthCheck });
  } catch (error) {
    healthCheck.message = error;
    response.status(503).send();
  }
};

module.exports = {
  appHealth,
};
