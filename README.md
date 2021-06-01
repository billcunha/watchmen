# Watchmen

Watchmen is a simple API to daily get hot posts on Reddit sub `/artificial/hot`. Also it provides endpoints to search posts and authors of these posts.

## What it does?

The API provides two endpoints:

- `GET /posts`: returns an array of `post` entity based on filters
  - want the `end` and `start` date to filter
  - want the `orderBy`, that defines the order of results

- `GET /authors`: returns the authors in database, summing the up votes and comments on your posts
  - want the `orderBy`, that defines the order of the results

Also it provides a scheduler. It runs every day at 8am, and collect the new hot posts on sub.

## What tech was used?

- [Hapi](https://hapi.dev) TS framework
- [Prisma](https://www.prisma.io/) ORM
- [Axios](https://axios-http.com/) HTTP client
- [Joi](https://joi.dev/) validator schema
- Typescript
- Yarn
- Docker
- Postgres

## Running

Make a clone of this repo in your GOPATH and run:

```bash
# build docker image for postgres
docker-compose up -d

# run application
yarn dev

# run a basic test
yarn test
```

## Using

For batter experience, to call the API you will need a REST client, like a Postman or Insomnia.