import { QueueClient } from "@vercel/queue";

const queue = new QueueClient({
  region: process.env.VERCEL_REGION ?? "fra1",
});

export const { handleCallback, send } = queue;
