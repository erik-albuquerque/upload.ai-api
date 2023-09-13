import { fastify } from 'fastify'
import { getAllPromptsRoute } from './routes'

const app = fastify()

const port = Number(process.env.PORT) || 3333 

app.register(getAllPromptsRoute)

app.listen({
  port
}).then(() => {
  console.log(`HTTP Server running on port: ${port}`)
})
