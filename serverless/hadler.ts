'use strict';
const webend = require('./webend');

module.exports.hello = ( event, context, callback ) => {
  const {instance, startSolution, options} = event;
  const solution = webend.Webend.main(instance, startSolution, options);
  const response = {
    statusCode: 200,
    body:{
      solution,
    },
  };

  callback( null, response );

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
