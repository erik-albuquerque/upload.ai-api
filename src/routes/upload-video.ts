import path from 'node:path'
import fs from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'

import { prisma } from '../lib'

const pump = promisify(pipeline)

const MB_TO_BYTES = 1_048_576

const FILE_SIZE =  MB_TO_BYTES * 25 // 25Mb

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: FILE_SIZE
    }
  })

  app.post('/uploads', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const fileData = await req.file()

      if(!fileData) {
        return res.status(400).send({ message: 'Missing file input.' })
      }

      const fileExtension = path.extname(fileData.filename)

      if(fileExtension !== '.mp3') {
        return res.status(400).send({ message: 'Invalid input type, please upload a MP3.' })
      }

      const fileBaseName = path.basename(fileData.filename, fileExtension)
      const fileUploadName = `${fileBaseName}-${randomUUID()}${fileExtension}`
      const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

      await pump(fileData.file, fs.createWriteStream(uploadDestination))

      const video = await prisma.video.create({
        data: {
          name: fileData.filename,
          path: uploadDestination
        }
      })

      return res.status(200).send({ video })
      
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send({ message: error.message })
      }
      
      return res.status(500).send({ message: 'Internal server error!' })
    }
  })
}