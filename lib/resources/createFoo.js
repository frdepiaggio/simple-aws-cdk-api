const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const TABLE_NAME = process.env.TABLE_NAME || 'Foo';

module.exports.handle = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'invalid request, parameter body missing',
    }
  }

  const item = JSON.parse(event.body.toString('utf-8'));
  const itemId = uuidv4();

  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: itemId,
      ...item,
    }
  };

  try {
    await db.put(params).promise();
    return {
      statusCode: 201,
      body: `${itemId} Foo item created successfully`
    };
  } catch (dbError) {
    return {
      statusCode: 500,
      body: JSON.stringify(dbError),
    };
  }
}