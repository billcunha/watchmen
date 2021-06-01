import Hapi from "@hapi/hapi";
import redditApi from "../redditApi";

const postsPlugin = {
  name: "app/posts",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/posts",
        handler: getPosts,
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
    const post = await prisma.post.findMany();
    return h.response(post || undefined).code(200);
  } catch (err) {
    console.log(err);
  }
}

async function cronPosts(request: Hapi.Request, h: Hapi.ResponseToolkit){
  const { prisma } = request.server.app;

  const response = await redditApi.get("/r/artificial/hot");

  // check if the return is correct
  if(!response || !response.data || !response.data.data || !response.data.data || !response.data.data.children) {
    h.response("the reddit api is unavailable").code(503)
    return
  }

  response.data.data.children.forEach(async function (item: any) {
    try {
      await prisma.post.upsert({
      create: {
        redditId: item.data.id,
        title: item.data.title,
        upVotes: item.data.ups,
        author: item.data.author,
        postedAt: new Date(item.data.created).toISOString()
      },
      update: {
        title: item.data.title,
        upVotes: item.data.ups,
        updatedAt: new Date().toISOString()
      },
      where: {
        redditId: item.data.id
      }});
    } catch (err) {
      console.log(err);
    }
  });

  return "ok";
}