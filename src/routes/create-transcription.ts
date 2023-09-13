import { createReadStream } from 'node:fs'

import { APIError } from 'openai'
import { ZodError } from 'zod'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { prisma, openai } from '../lib'

import { transcriptionBodySchema, transcriptionParamsSchema } from '../schemas'

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post(
    '/videos/:videoId/transcription',
    async (req: FastifyRequest, res: FastifyReply) => {
      try {
        const { videoId } = transcriptionParamsSchema.parse(req.params)

        const { prompt } = transcriptionBodySchema.parse(req.body)

        const video = await prisma.video.findFirstOrThrow({
          where: {
            id: videoId,
          },
        })

        const videoPath = video.path
        const audioReadStream = createReadStream(videoPath)

        const { text: transcription } =
          await openai.audio.transcriptions.create({
            file: audioReadStream,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'json',
            temperature: 0,
            prompt,
          })

        await prisma.video.update({
          data: {
            transcription,
          },
          where: {
            id: videoId,
          },
        })

        return res.status(200).send({ transcription })
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).send({
            message: 'Invalid fields',
            errors: error.issues,
          })
        } else if (error instanceof APIError) {
          return res.status(400).send({ message: error.message })
        } else if (error instanceof Error) {
          return res.status(400).send({ message: error.message })
        }

        return res.status(500).send({ message: 'Internal server error!' })
      }
    },
  )
}
