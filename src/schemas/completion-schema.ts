import { z } from 'zod'

const completionSchema = z.object({
  videoId: z.string().uuid(),
  template: z.string(),
  temperature: z.number().min(0).max(1).default(0.5),
})

type CompletionSchemaType = z.infer<typeof completionSchema>

export { completionSchema }

export type { CompletionSchemaType }
