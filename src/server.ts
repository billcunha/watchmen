import Hapi from "@hapi/hapi";
import prisma from "./plugins/prisma";
import posts from "./plugins/posts";
import healthz from "./plugins/healthz";

const HapiCron = require("hapi-cron");

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",
});

export async function createServer(): Promise<Hapi.Server> {
  await server.register([healthz, prisma, posts]);
  await server.register({
    plugin: HapiCron,
    options: {
      jobs: [{
          name: "updatePosts",
          time: "0 8 * * *",
          timezone: "America/Sao_Paulo",
          request: {
              method: "PUT",
              url: "/posts",
              allowInternals: true
          },
          onComplete: (res: any) => {
              console.log("Cronjob finished: " + res);
          }
      }]
    }
  });
  return server;
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
  return server;
}

process.on("unhandledRejection", async (err) => {
  await server.app.prisma.$disconnect();
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});