const axios = require('axios').default;

const redditApi = axios.create({
  baseURL: "https://api.reddit.com",
});

export default redditApi;