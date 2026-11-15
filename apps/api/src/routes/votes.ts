import { Hono } from "hono"
import db from "../db/index.js"
import { parseJsonBody } from "../lib/json.js"
import { statusFor } from "../lib/result.js"
import { requireAuth } from "../middleware/auth.js"
import { createVoting } from "../voting/index.js"

const voting = createVoting({ db })
const votes = new Hono().post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const result = await voting.cast({
    user,
    targetType: raw.targetType,
    targetId: raw.targetId,
    value: raw.value,
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(
    {
      ...result.data,
      studentVote: result.data.userVote,
    },
    200
  )
})

export { votes }
