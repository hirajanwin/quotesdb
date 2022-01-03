import expressPlayground from 'graphql-playground-middleware-express'

export default function handler(req, res) {
  if (req.method === 'GET')
    expressPlayground({
      endpoint: '/api/graphql',
    })(req, res)
  else {
    return res.status(400).end()
  }
}
