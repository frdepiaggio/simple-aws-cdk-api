#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { ServerlessApiStack } = require('../lib/serverless-api-stack');

const app = new cdk.App();
new ServerlessApiStack(app, 'ServerlessApiStack');
