import { fastify } from 'fastify'

const app = fastify()

const port = Number(process.env.PORT) || 3333 

app.get('/', () => {
  return 'hello from api'
})

app.listen({
  port
}).then(() => {
  console.log(`HTTP Server running on port: ${port}`)
})
