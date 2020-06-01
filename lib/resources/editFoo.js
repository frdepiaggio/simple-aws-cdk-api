const aws = require('aws-sdk');
const db = new aws.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Foo';

module.exports.handle = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'invalid request, you are missing the parameter body'
    };
  }

  const editedItemId = event.pathParameters.id;
  if (!editedItemId) {
    return {
      statusCode: 400,
      body: 'invalid request, you are missing the path parameter id'
    };
  }

  const editedItem = JSON.parse(event.body.toString('utf-8'));
  const editedItemProperties = Object.keys(editedItem);
  if (!editedItem || editedItemProperties.length < 1) {
    return {
      statusCode: 400,
      body: 'invalid request, no arguments provided'
    };
  }
  let editedExp = 'set ';
  let editedAttr = {};
  let editedExpNames = {};
  for (let i = 0; i < editedItemProperties.length; i += 1) {
    const prop = editedItemProperties[i];
    editedExp = `${editedExp} #foo_${prop} = :${prop}, `
    editedAttr[`:${prop}`] = editedItem[prop];
    editedExpNames[`#foo_${prop}`] = prop;
  }
  editedExp = editedExp.slice(0, -2);
  console.log(editedExp);

  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: editedItemId,
    },
    UpdateExpression: editedExp,
    ExpressionAttributeValues: editedAttr,
    ExpressionAttributeNames: editedExpNames,
    ReturnValues: 'UPDATED_NEW',
  };
  try {
    await db.update(params).promise();
    return {
      statusCode: 200,
      body: `Item ${editedItemId} was edited successfully`
    };
  } catch (dbError) {
    return {
      statusCode: 500,
      body: JSON.stringify(dbError)
    };
  }
}

