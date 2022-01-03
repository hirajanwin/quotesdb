import { ApolloError, ApolloServer, gql } from 'apollo-server-micro'
import db from '../../db/middleware'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { applyMiddleware } from 'graphql-middleware'
import rateLimit from '../../utils/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

const typeDefs = gql`
  type Query {
    quotes(offset: Int, limit: Int, show: String, character: String): [Quote!]!
    characters(show: String): [Character!]!
    shows(offset: Int, limit: Int, type: String): [Show!]!
    randomQuotes(count: Int): [Quote]!
    types: [Type!]!
  }

  type Quote {
    quote: String!
    show: Show!
    character: Character!
  }

  type Show {
    title: String!
    type: Type!
  }

  type Character {
    name: String!
    show: Show!
  }

  type Type {
    name: String!
  }
`

const resolvers = {
  Query: {
    async quotes(parent, args, ctx) {
      const db = await ctx.db
      const { limit, offset, show, character } = args
      let showId, characterId
      if (show) {
        showId = (await db.Shows.findOne({ title: show }, { _id: true }))?.id
      }
      if (character) {
        characterId = (
          await db.Characters.findOne({ name: character }, { _id: true })
        )?.id
      }
      const filters = { show: showId, character: characterId }

      if (!character) {
        delete filters.character
      }
      if (!show) {
        delete filters.show
      }

      return await db.Quotes.find(filters, {
        __v: false,
      })
        .skip(offset || 0)
        .limit(limit || 10)
    },
    async characters(parent, args, ctx) {
      const db = await ctx.db
      const { show } = args
      let showId
      if (show) {
        showId = (await db.Shows.findOne({ title: show }, { _id: true }))?.id
      }

      return await db.Characters.find(show ? { show: showId } : {}, {
        __v: false,
      })
    },
    async shows(parent, args, ctx) {
      const db = await ctx.db
      const { limit, offset, type } = args

      let typeId
      if (type) {
        typeId = (await db.Types.findOne({ name: type }, { _id: true }))?.id
      }

      return await db.Shows.find(type ? { type: typeId } : {}, { __v: false })
        .skip(offset || 0)
        .limit(limit || 10)
    },
    async randomQuotes(parent, args, ctx) {
      const db = await ctx.db
      const { count } = args
      return await db.Quotes.aggregate([{ $sample: { size: count || 1 } }])
    },
    async types(parent, args, ctx) {
      const db = await ctx.db
      return await db.Types.find({}, { __v: false })
    },
  },
  Quote: {
    async character(parent, args, ctx) {
      const db = await ctx.db
      return await db.Characters.findById(parent.character.toString())
    },
    async show(parent, args, ctx) {
      const db = await ctx.db
      return await db.Shows.findById(parent.show.toString())
    },
  },
  Character: {
    async show(parent, args, ctx) {
      const db = await ctx.db
      return await db.Shows.findById(parent.show.toString())
    },
  },
  Show: {
    async type(parent, args, ctx) {
      const db = await ctx.db
      return await db.Types.findById(parent.type.toString())
    },
  },
}

const middleware = async (resolve, root, args, ctx, info) => {
  try {
    await limiter.check(ctx.res, 11, ctx.req.connection.remoteAddress)
    return await resolve(root, args, ctx, info)
  } catch {
    throw new ApolloError('Limit Reached!')
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const schemaWithMiddleware = applyMiddleware(schema, {
  Query: {
    randomQuotes: middleware,
    quotes: middleware,
    characters: middleware,
    shows: middleware,
    randomQuotes: middleware,
    types: middleware,
  },
})

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, db: db() }),
  schema: schemaWithMiddleware,
  formatError: (err) => {
    return { message: err.message }
  },
})

const startServer = apolloServer.start()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  await startServer
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
