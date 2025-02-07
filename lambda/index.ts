const aws = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  if (event.httpMethod === 'POST') {
    // Insert data into DynamoDB
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return { statusCode: 400, body: "Invalid JSON" };
    }
    const params = {
      TableName: table,
      Item: { id: body.id, data: body.data }
    };
    try {
      await dynamodb.put(params).promise();
      return { statusCode: 200, body: JSON.stringify({ message: "Item inserted", item: params.Item }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  } else if (event.httpMethod === 'GET') {
    // Retrieve data from DynamoDB
    const params = { TableName: table };
    try {
      const result = await dynamodb.scan(params).promise();
      return { statusCode: 200, body: JSON.stringify(result.Items) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  }
  
  return { statusCode: 400, body: JSON.stringify({ message: "Unsupported HTTP method" }) };
};