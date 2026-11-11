const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const {
  docClient,
  getTableName,
  internalError,
  jsonResponse,
  parseBody,
} = require("./dynamo");

exports.lambdaHandler = async (event) => {
  let body;
  try {
    body = parseBody(event);
  } catch {
    return jsonResponse(400, { message: "Request body must be valid JSON" });
  }

  if (
    typeof body.town !== "string" ||
    !body.town.trim() ||
    typeof body.weather !== "string" ||
    !body.weather.trim()
  ) {
    return jsonResponse(400, {
      message: "Both town and weather are required",
    });
  }

  const item = {
    town: body.town.trim(),
    weather: body.weather.trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: getTableName(),
        Item: item,
      })
    );
    return jsonResponse(201, { message: "Weather created", item });
  } catch (error) {
    return internalError("create", error);
  }
};
