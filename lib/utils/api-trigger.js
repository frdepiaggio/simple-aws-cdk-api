const apigateway = require('@aws-cdk/aws-apigateway');

const apiTrigger = (api, apiPath, APIMethod, handler, bucket, authOpts) => {
  const lambdaIntegration = new apigateway.LambdaIntegration(handler);
  const resource = api.root.resourceForPath(apiPath);

  bucket.grantReadWrite(handler);

  resource.addMethod(APIMethod, lambdaIntegration, authOpts);
};

module.exports = apiTrigger;