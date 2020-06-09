const cdk = require('@aws-cdk/core');
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const s3 = require("@aws-cdk/aws-s3");
const apiTrigger = require('./utils/api-trigger');
const path = require('path');

class TestApiFDepiaggioStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, "TestApiFDepiaggioStore");

    const fooTable = new dynamodb.Table(this, "foo-test-fdepiaggio", {
      tableName: "Foo",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });


    const api = new apigateway.RestApi(this, "test-api-fdepiaggio", {
      restApiName: "test-api-fdepiaggio",
      description: "This is a Test API."
    });

    const getAllFoo = new lambda.Function(this, "test-fdepiaggio-getAllFoo", {
      functionName: `test-fdepiaggio-getAllFoo`,
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: "getAllFoo.handle",
      code: lambda.Code.fromAsset(path.join(__dirname, 'resources')),
      environment: {
        TABLE_NAME: fooTable.tableName,
      }
    });

    const getOneFoo = new lambda.Function(this, "test-fdepiaggio-getOneFoo", {
      functionName: `test-fdepiaggio-getOneFoo`,
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: "getOneFoo.handle",
      code: lambda.Code.fromAsset(path.join(__dirname, 'resources')),
      environment: {
        TABLE_NAME: fooTable.tableName,
      }
    });

    const createFoo = new lambda.Function(this, "test-fdepiaggio-createFoo", {
      functionName: `test-fdepiaggio-createFoo`,
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: "createFoo.handle",
      timeout: cdk.Duration.seconds(350),
      code: lambda.Code.fromAsset(path.join(__dirname, 'resources')),
      environment: {
        TABLE_NAME: fooTable.tableName,
      }
    });

    const editFoo = new lambda.Function(this, "test-fdepiaggio-editFoo", {
      functionName: `test-fdepiaggio-editFoo`,
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: "editFoo.handle",
      timeout: cdk.Duration.seconds(350),
      code: lambda.Code.fromAsset(path.join(__dirname, 'resources')),
      environment: {
        TABLE_NAME: fooTable.tableName,
      }
    });

    const deleteFoo = new lambda.Function(this, "test-fdepiaggio-deleteFoo", {
      functionName: `test-fdepiaggio-deleteFoo`,
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: "deleteFoo.handle",
      timeout: cdk.Duration.seconds(350),
      code: lambda.Code.fromAsset(path.join(__dirname, 'resources')),
      environment: {
        TABLE_NAME: fooTable.tableName,
      }
    });

    fooTable.grantReadWriteData(getAllFoo);
    fooTable.grantReadWriteData(createFoo);
    fooTable.grantReadWriteData(getOneFoo);
    fooTable.grantReadWriteData(editFoo);
    fooTable.grantReadWriteData(deleteFoo);

    apiTrigger(api, "foo", 'GET', getAllFoo, bucket);
    apiTrigger(api, "foo/{id}", 'GET', getOneFoo, bucket);
    apiTrigger(api, "foo", 'POST', createFoo, bucket);
    apiTrigger(api, "foo/{id}", 'PATCH', editFoo, bucket);
    apiTrigger(api, "foo/{id}", 'DELETE', deleteFoo, bucket);
  }
}

module.exports = { TestApiFDepiaggioStack }

