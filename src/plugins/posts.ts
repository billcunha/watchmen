import Hapi from '@hapi/hapi'

const postsPlugin = {
  name: 'app/posts',
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/posts',
        handler: getPosts,
      },
    ])
  },
}

export default postsPlugin;

async function getPosts(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app

  const postId = Number(request.params.postId)

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })
    return h.response(post || undefined).code(200)
  } catch (err) {
    console.log(err)
  }
}