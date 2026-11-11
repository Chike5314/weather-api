const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, getTableName, internalError, jsonResponse } = require("./dynamo");

exports.lambdaHandler = async (_event) => {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: getTableName() })
    );
    return jsonResponse(200, result.Items || []);
  } catch (error) {
    return internalError("list", error);
  }
};
