const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, getTableName, internalError, jsonResponse } = require("./dynamo");

exports.lambdaHandler = async (event) => {
  const town = event.pathParameters && event.pathParameters.town;
  if (typeof town !== "string" || !town.trim()) {
    return jsonResponse(400, { message: "A town path parameter is required" });
  }

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: getTableName(),
        Key: { town: town.trim() },
      })
    );
    return jsonResponse(200, { message: "Weather deleted", town: town.trim() });
  } catch (error) {
    return internalError("delete", error);
  }
};
