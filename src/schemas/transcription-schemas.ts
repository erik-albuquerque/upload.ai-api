import { z } from 'zod'

const transcriptionBodySchema = z.object({
  prompt: z.string(),
})

const transcriptionParamsSchema = z.object({
  videoId: z.string().uuid(),
})

type TranscriptionBodySchemaType = z.infer<typeof transcriptionBodySchema>

type TranscriptionParamsSchemaType = z.infer<typeof transcriptionParamsSchema>

export { transcriptionBodySchema, transcriptionParamsSchema }

export type { TranscriptionBodySchemaType, TranscriptionParamsSchemaType }
