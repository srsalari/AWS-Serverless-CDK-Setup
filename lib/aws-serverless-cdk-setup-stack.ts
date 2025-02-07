import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ServerlessAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table with primary key "id"
    const table = new dynamodb.Table(this, 'DataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // for production, consider using RETAIN
    });

    // Create an IAM Role for Lambda with Full DynamoDB Access
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    // Create the Lambda function that inserts and retrieves data from DynamoDB
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda', {
        bundling: {
          image: lambda.Runtime.NODEJS_18_X.bundlingImage,
          command: [
            'bash', '-c', [
              'npm install',
              'cp -r . /asset-output'
            ].join(' && ')
          ]
        }
      }),
      handler: 'index.handler',
      role: lambdaRole,
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    // Grant the Lambda function permission to access DynamoDB
    table.grantReadWriteData(lambdaFunction);

    // Create an API Gateway REST API backed by the Lambda function
    const api = new apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: lambdaFunction,
      proxy: false // Allows creating custom API resources/methods
    });

    // Define the /items resource with GET and POST methods
    const items = api.root.addResource('items');
    items.addMethod('POST'); // For inserting data
    items.addMethod('GET');  // For retrieving data
  }
}