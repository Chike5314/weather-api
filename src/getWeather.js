const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, getTableName, internalError, jsonResponse } = require("./dynamo");

exports.lambdaHandler = async (event) => {
  const town = event.pathParameters && event.pathParameters.town;
  if (typeof town !== "string" || !town.trim()) {
    return jsonResponse(400, { message: "A town path parameter is required" });
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: getTableName(),
        Key: { town: town.trim() },
      })
    );
    if (!result.Item) {
      return jsonResponse(404, { message: "Weather not found" });
    }
    return jsonResponse(200, result.Item);
  } catch (error) {
    return internalError("get", error);
  }
};
