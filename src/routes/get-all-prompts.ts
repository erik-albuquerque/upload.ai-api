import { FastifyInstance, FastifyReply } from 'fastify'
import { prisma } from '../lib'

export async function getAllPromptsRoute(app: FastifyInstance) {
  app.get('/prompts', async (_, res: FastifyReply) => {
    try {
      const prompts = await prisma.prompt.findMany()

      return res.status(200).send({ prompts })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send({ message: error.message })
      }

      return res.status(500).send({ message: 'Internal server error!' })
    }
  })
}
