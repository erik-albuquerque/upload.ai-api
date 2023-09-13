import { APIError } from 'openai'
import { ZodError } from 'zod'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { prisma, openai } from '../lib'

import { completionSchema } from '../schemas'

export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post('/ai/completion', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { videoId, template, temperature } = completionSchema.parse(
        req.body,
      )

      const video = await prisma.video.findFirstOrThrow({
        where: {
          id: videoId,
        },
      })

      if (!video.transcription) {
        return res.status(400).send({
          statusCode: 400,
          message: 'Video transcription was not generated yet.',
        })
      }

      const promptMessage = template.replace(
        '{transcription}',
        video.transcription,
      )

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        messages: [{ role: 'user', content: promptMessage }],
        temperature,
      })

      return res.status(200).send({
        statusCode: 200,
        response,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send({
          statusCode: 400,
          message: 'Invalid fields',
          errors: error.issues,
        })
      } else if (error instanceof APIError) {
        return res.status(400).send({
          statusCode: 400,
          message: error.message,
        })
      } else if (error instanceof Error) {
        return res.status(400).send({
          statusCode: 400,
          message: error.message,
        })
      }

      return res.status(500).send({
        statusCode: 500,
        message: 'Internal server error!',
      })
    }
  })
}
