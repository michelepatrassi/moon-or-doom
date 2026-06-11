import { Item } from "dynamoose/dist/Item";

import dynamoose, { dynamooseTableOptions } from "../dynamodb";
import { Guess, GuessDirection, GuessStatus } from "./guess.types";

export class GuessItem extends Item implements Guess {
  id: string;
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
  status: GuessStatus;
  createdAt: string;
  updatedAt: string;
  resolvesAfter: string;
  resolvedAt?: string;
  resolvedPrice?: number;
}

const guessSchema = new dynamoose.Schema(
  {
    playerId: {
      type: String,
      hashKey: true,
      required: true,
    },
    id: {
      type: String,
      rangeKey: true,
      required: true,
    },
    direction: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
    resolvesAfter: {
      type: String,
      required: true,
    },
    resolvedAt: {
      type: String,
    },
    resolvedPrice: {
      type: Number,
    },
  },
  {
    saveUnknown: false,
  }
);

export const GuessModel = dynamoose.model<GuessItem>("Guess", guessSchema, {
  tableName: "guesses",
  ...dynamooseTableOptions,
});
