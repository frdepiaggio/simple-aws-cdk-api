const aws = require('aws-sdk');
const db = new aws.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Foo';

module.exports.handle = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  try {
    const response = await db.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (dbError) {
    return {
      statusCode: 500,
      body: JSON.stringify(dbError),
    };
  }
}

