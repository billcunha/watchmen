import Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import prisma from "./plugins/prisma";
import posts from "./plugins/posts";

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
});

export async function start(): Promise<Hapi.Server> {
  await server.register([prisma, posts])
  await server.start()
  return server
}

process.on('unhandledRejection', async (err) => {
  await server.app.prisma.$disconnect()
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});