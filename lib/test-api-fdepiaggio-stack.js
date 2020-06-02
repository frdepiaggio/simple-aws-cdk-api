const cdk = require('@aws-cdk/core');
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const cognito = require("@aws-cdk/aws-cognito");
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

    // Cognito
    const userPool = new cognito.UserPool(this, "test-api-fdepiaggio-user-pool", {
      userPoolName: "TestApiFDepiaggioUserPool",
      signInAliases: {
        email: true,
      },
      autoVerify: { email: true }, // Default
      requiredAttributes: {
        email: true,
      },
      customAttributes: {
        joindate: new cognito.DateTimeAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
        tempPasswordValidity: cdk.Duration.days(7),
      },
      selfSignUpEnabled: false,
    });

    const userPoolClient = new cognito.UserPoolClient(
        this,
        "test-api-fdepiaggio-tracker-client",
        {
          userPoolClientName: "TestApiFDepiaggioTrackerClient",
          userPool: userPool,
          authFlows: {
            userPassword: true,
            refreshToken: true,
          },
        }
    );

    const adminGroup = new cognito.CfnUserPoolGroup(this, "admin-group", {
      groupName: "Admin",
      userPoolId: userPool.userPoolId,
    });

    const userGroup = new cognito.CfnUserPoolGroup(
        this,
        "user-group",
        {
          groupName: "User",
          userPoolId: userPool.userPoolId,
        }
    );

    const api = new apigateway.RestApi(this, "test-api-fdepiaggio", {
      restApiName: "test-api-fdepiaggio",
      description: "This is a Test API."
    });

    const auth = new apigateway.CfnAuthorizer(this, "test-api-fdepiaggio-cognito-authorizer", {
      name: `TestApiFDepiaggioCognitoAuthorizer`,
      type: apigateway.AuthorizationType.COGNITO,
      authorizerResultTtlInSeconds: 300,
      identitySource: "method.request.header.Authorization",
      restApiId: api.restApiId,
      providerArns: [userPool.userPoolArn],
    });

    const authorizationOptions = {
      apiKeyRequired: false,
      authorizer: { authorizerId: auth.ref },
      authorizationType: "COGNITO_USER_POOLS",
    };

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

    apiTrigger(api, "foo", 'GET', getAllFoo, bucket, authorizationOptions);
    apiTrigger(api, "foo/{id}", 'GET', getOneFoo, bucket, authorizationOptions);
    apiTrigger(api, "foo", 'POST', createFoo, bucket, authorizationOptions);
    apiTrigger(api, "foo/{id}", 'PATCH', editFoo, bucket, authorizationOptions);
    apiTrigger(api, "foo/{id}", 'DELETE', deleteFoo, bucket, authorizationOptions);
  }
}

module.exports = { TestApiFDepiaggioStack }

