import { Item } from "dynamoose/dist/Item";

import dynamoose, { dynamooseTableOptions } from "../dynamodb";
import { Player } from "./player.types";

export class PlayerItem extends Item implements Player {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  latestGuessId?: string;
}

const playerSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
  },
  score: {
    type: Number,
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
  latestGuessId: {
    type: String,
  },
});

export const PlayerModel = dynamoose.model<PlayerItem>("Player", playerSchema, {
  tableName: "players",
  ...dynamooseTableOptions,
});
