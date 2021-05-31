import { start } from "./server";

start().then((server) => {
    console.log(`Server ready at: ${server.info.uri}`)
  })
  .catch((err) => {
    console.log(err)
})