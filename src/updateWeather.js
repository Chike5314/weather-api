const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const {
  docClient,
  getTableName,
  internalError,
  jsonResponse,
  parseBody,
} = require("./dynamo");

exports.lambdaHandler = async (event) => {
  const town = event.pathParameters && event.pathParameters.town;
  if (typeof town !== "string" || !town.trim()) {
    return jsonResponse(400, { message: "A town path parameter is required" });
  }

  let body;
  try {
    body = parseBody(event);
  } catch {
    return jsonResponse(400, { message: "Request body must be valid JSON" });
  }
  if (typeof body.weather !== "string" || !body.weather.trim()) {
    return jsonResponse(400, { message: "A weather value is required" });
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: getTableName(),
        Key: { town: town.trim() },
        UpdateExpression: "SET #weather = :weather, updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#weather": "weather" },
        ExpressionAttributeValues: {
          ":weather": body.weather.trim(),
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return jsonResponse(200, result.Attributes);
  } catch (error) {
    return internalError("update", error);
  }
};
