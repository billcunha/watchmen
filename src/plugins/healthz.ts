import Hapi from '@hapi/hapi'

const healthzPlugin = {
  name: 'app/healthz',
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/healthz',
        handler: getHealthz,
      },
    ])
  },
}

export default healthzPlugin;

async function getHealthz(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  return "Hello!";
}