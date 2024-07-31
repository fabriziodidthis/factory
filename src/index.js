const app = require('./app');
const port = process.env.NODE_PORT || 3000;

app.listen(port, () => {
  console.log(`Servico rodando em http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received');
  console.log('Closing HTTP server');
});
