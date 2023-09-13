import path from 'node:path'
import fs from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'

import { prisma } from '../lib'

import { bytesToMB } from '../utils'

const pump = promisify(pipeline)

const MB_BYTES = 1_048_576

const MAX_FILE_SIZE = MB_BYTES * 25 // 25MB

const ACCEPTED_MIME_TYPES = ['audio/mpeg', 'audio/mpeg3']

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  })

  app.post('/videos/upload', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const fileData = await req.file()

      if (!fileData) {
        return res.status(400).send({
          statusCode: 400,
          message: 'Missing file input.',
        })
      }

      // Return a Buffer with the stream content
      await fileData.toBuffer().catch((error) => {
        console.log('file buffer error: ', error.message)
        // This error will be dealt with below ↓
      })

      const fileSize = fileData.file.bytesRead

      const fileSizeInMB = bytesToMB(fileSize)

      const maxFileSizeInMB = bytesToMB(MAX_FILE_SIZE)

      if (fileSize > MAX_FILE_SIZE) {
        return res.status(413).send({
          statusCode: 413,
          message: `The file must not be larger than ${maxFileSizeInMB}MB, but was ${fileSizeInMB}MB.`,
        })
      }

      const fileMimeType = ACCEPTED_MIME_TYPES.includes(fileData.mimetype)

      if (!fileMimeType) {
        return res.status(400).send({
          statusCode: 400,
          message: `File must be one of MIME types: [${ACCEPTED_MIME_TYPES.join(
            ', ',
          )}], but was ${fileData.mimetype}.`,
        })
      }

      const fileExtension = path.extname(fileData.filename)

      const fileBaseName = path.basename(fileData.filename, fileExtension)
      const fileUploadName = `${fileBaseName}-${randomUUID()}${fileExtension}`
      const uploadDestination = path.resolve(
        __dirname,
        '../../tmp',
        fileUploadName,
      )

      await pump(fileData.file, fs.createWriteStream(uploadDestination))

      const video = await prisma.video.create({
        data: {
          name: fileData.filename,
          path: uploadDestination,
        },
      })

      return res.status(200).send({
        statusCode: 200,
        video,
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send({
          statusCode: 400,
          message: error.message,
        })
      }

      return res
        .status(500)
        .send({ statusCode: 500, message: 'Internal server error!' })
    }
  })
}
