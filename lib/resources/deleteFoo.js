const aws = require('aws-sdk');
const db = new aws.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Foo';

module.exports.handle = async (event) => {
  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return {
      statusCode: 400,
      body: `Error: You are missing the path parameter id`
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: requestedItemId,
    }
  };

  try {
    await db.delete(params).promise();
    return {
      statusCode: 200,
      body: `Item ${requestedItemId} was deleted successfully`
    };
  } catch (dbError) {
    return {
      statusCode: 500,
      body: JSON.stringify(dbError)
    };
  }
}

