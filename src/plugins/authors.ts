import { Prisma } from ".prisma/client";
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
              orderBy: Joi.any().valid("upVotes", "numComments").required(),
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
    const post = await prisma.post.groupBy({
      by: ["author"],
      _sum: {
        upVotes: true,
        numComments: true,
      },
      orderBy: {
        _sum: getOrder(request.query.orderBy),
      },
    });
    return h.response(post || undefined).code(200);
  } catch (err) {
    console.log(err);
  }
}

function getOrder(orderBy: string) : Prisma.PostOrderByWithAggregationInput {
  if (orderBy == "upVotes") {
    return {
      upVotes: "desc"
    };
  }

  return {
    numComments: "desc"
  };
}