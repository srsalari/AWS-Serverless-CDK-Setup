#!/usr/bin/env node
// filepath: /serverless-app/bin/serverless-app.ts
import * as cdk from 'aws-cdk-lib';
import { AwsServerlessCdkStack } from '../lib/aws-serverless-cdk-setup-stack';

const app = new cdk.App();
new AwsServerlessCdkStack(app, 'ServerlessAppStack');