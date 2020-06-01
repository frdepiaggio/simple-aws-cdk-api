#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { TestApiFDepiaggioStack } = require('../lib/test-api-fdepiaggio-stack');

const app = new cdk.App();
new TestApiFDepiaggioStack(app, 'TestApiFDepiaggioStack');
