#!/usr/bin/env node
// filepath: /serverless-app/bin/serverless-app.ts
import * as cdk from 'aws-cdk-lib';
import { ServerlessAppStack } from '../lib/aws-serverless-cdk-setup-stack';

const app = new cdk.App();
new ServerlessAppStack(app, 'ServerlessAppStack');