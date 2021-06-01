import Hapi from "@hapi/hapi";
import Joi from "joi";

const postsPlugin = {
  name: "app/authors",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/authors",
        handler: getAuthors,
        options: {
          validate: {
            query: Joi.object({
              sort: Joi.any().valid("upVotes", "numComments").required(),
            })
          }
        }
      },
    ])
  },
}

export default postsPlugin;

async function getAuthors(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;

  try {
    const post = await prisma.post.findMany();
    return h.response(post || undefined).code(200);
  } catch (err) {
    console.log(err);
  }
}