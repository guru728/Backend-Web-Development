
const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const http = require('./utils/http');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/', postRoutes);

  // Safe route for demonstrating internal server errors.
  app.get('/explode', controller.explode);

  // Handle requests to routes that do not exist.
  app.use((req, res) => {
    return http.sendError(
      res,
      404,
      'NOT_FOUND',
      'Route not found'
    );
  });

  // Handle errors in one place.
  app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
      return next(err);
    }

    const status = err.statusCode || err.status || 500;

    if (status >= 500) {
      return http.sendError(
        res,
        500,
        'INTERNAL_ERROR',
        'Something went wrong'
      );
    }

    return http.sendError(
      res,
      status,
      err.code || 'VALIDATION_ERROR',
      status === 400 ? 'Invalid request' : 'Request failed',
      err.details
    );
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;

  app.listen(port, () => {
    console.log(`Starter API listening on port ${port}`);
  });
}

module.exports = { createApp, resetData };
