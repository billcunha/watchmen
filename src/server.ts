import Hapi from "@hapi/hapi";
import prisma from "./plugins/prisma";
import posts from "./plugins/posts";
import healthz from "./plugins/healthz";

const HapiCron = require('hapi-cron');

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
});

export async function start(): Promise<Hapi.Server> {
  await server.register([healthz, prisma, posts]);
  await server.register({
    plugin: HapiCron,
    options: {
      jobs: [{
          name: 'testcron',
          time: '0 8 * * *',
          timezone: 'Europe/London',
          request: {
              method: 'GET',
              url: '/test-url'
          },
          onComplete: (res: any) => {
              console.log(res); // 'hello world'
          }
      }]
  }
  });
  await server.start();
  return server;
}

process.on('unhandledRejection', async (err) => {
  await server.app.prisma.$disconnect();
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});