const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const docClient = {
  send: (command) => client.send(command),
  destroy: () => client.destroy(),
};

function getTableName() {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    throw new Error("TABLE_NAME environment variable is not set");
  }
  return tableName;
}

function parseBody(event) {
  const body =
    typeof event.body === "string"
      ? JSON.parse(event.body)
      : event.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }
  return body;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function internalError(operation, error) {
  console.error(`Failed to ${operation} weather data`, error);
  return jsonResponse(500, { message: "Internal server error" });
}

module.exports = {
  docClient,
  getTableName,
  internalError,
  jsonResponse,
  parseBody,
};
