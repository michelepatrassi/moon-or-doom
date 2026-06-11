import dynamoose from "dynamoose";

if (process.env.NODE_ENV === "development") {
  dynamoose.aws.ddb.local();
}

export default dynamoose;

export const dynamooseTableOptions = {
  create: false,
  update: false,
  waitForActive: false,
};
