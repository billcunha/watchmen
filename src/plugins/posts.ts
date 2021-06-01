import Hapi from "@hapi/hapi";
import redditApi from "../redditApi";
import Joi from "joi";
import { Prisma } from "@prisma/client";

const postsPlugin = {
  name: "app/posts",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/posts",
        handler: getPosts,
        options: {
          validate: {
            query: Joi.object({
              start: Joi.date().less("now").required(),
              end: Joi.date().greater(Joi.ref("start")).required(),
              orderBy: Joi.any().valid("upVotes", "numComments").required(),
            })
          }
        }
      },
    ])

    // Internal route used for cronjob
    server.route([
      {
        method: "PUT",
        path: "/posts",
        handler: cronPosts,
        options: {
          isInternal: true,
        }
      },
    ])
  },
}

export default postsPlugin;

async function getPosts(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;

  try {
    const post = await prisma.post.findMany({
      where: {
        postedAt: {
          gte: new Date(request.query.start),
          lte: new Date(request.query.end),
        }
      },
      orderBy: getOrder(request.query.orderBy)
    });
    return h.response(post || undefined).code(200);
  } catch (err) {
    console.log(err);
  }
}

function getOrder(orderBy: string) : Prisma.Enumerable<Prisma.PostOrderByInput> {
  if (orderBy == "upVotes") {
    return {
      upVotes: "desc"
    };
  }

  return {
    numComments: "desc"
  };
}

async function cronPosts(request: Hapi.Request, h: Hapi.ResponseToolkit){
  const { prisma } = request.server.app;

  let response;

  try {
    // limit 50 to increase the ammount of posts
    response = await redditApi.get("/r/artificial/hot?limit=50");
  } catch (err) {
    console.log(err);
    h.response("Fail on get reddit api").code(503);
    return;
  }

  // check if the return is correct
  if(!response || !response.data || !response.data.data || !response.data.data || !response.data.data.children) {
    h.response("the reddit api is unavailable").code(503)
    return
  }

  response.data.data.children.forEach(async function (item: any) {
    try {
      // perform a upsert: insert if does not exist, update if exists
      await prisma.post.upsert({
      create: {
        redditId: item.data.id,
        title: item.data.title,
        upVotes: item.data.ups,
        numComments: item.data.num_comments,
        author: item.data.author,
        // 1000 to convert unix timestamp to Date
        postedAt: new Date(item.data.created * 1000).toISOString()
      },
      update: {
        title: item.data.title,
        upVotes: item.data.ups,
        numComments: item.data.num_comments,
        updatedAt: new Date().toISOString()
      },
      where: {
        redditId: item.data.id
      }});
    } catch (err) {
      console.log(err);
      h.response("Fail on save data on db").code(500);
      return;
    }
  });

  return "ok";
}