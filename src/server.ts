import 'dotenv/config'

import { fastify } from 'fastify'

import { fastifyCors } from '@fastify/cors'

import {
  getAllPromptsRoute,
  uploadVideoRoute,
  createTranscriptionRoute,
  generateAICompletionRoute,
} from './routes'

const app = fastify()

const port = Number(process.env.PORT) || 3333

app.register(fastifyCors, {
  origin: '*',
})

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAICompletionRoute)

app
  .listen({
    port,
  })
  .then(() => {
    console.log(`HTTP Server running on port: ${port}`)
  })
