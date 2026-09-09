import { Hono } from "hono";
import { createContactMessage } from "../utils/repositories.js";
import { contactSchema, formatZodError } from "../utils/validation.js";

const contact = new Hono();

contact.post("/", async (c) => {
  let body;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: "Validation failed",
        details: formatZodError(parsed.error),
      },
      422
    );
  }

  const message = createContactMessage(parsed.data);

  return c.json(
    {
      data: {
        id: message.id,
        message: "Thanks — your message was received.",
      },
    },
    201
  );
});

export default contact;
