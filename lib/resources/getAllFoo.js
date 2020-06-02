const aws = require('aws-sdk');
const db = new aws.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Foo';

module.exports.handle = async () => {
  // Initialize the Amazon Cognito credentials provider
  aws.config.region = 'us-east-2'; // Region
  aws.config.credentials = new aws.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-2:1b2a61f7-f15a-4a74-89e7-212d3bc80f48',
  });

  console.log(aws.config);

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

