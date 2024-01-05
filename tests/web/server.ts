// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';

export default function serveApp(port: number) {
  const app = express();
  app.use(express.static('./'));

  const server = app.listen(port);

  return server;
}

serveApp(3000);
