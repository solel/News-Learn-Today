const fetch = require('node-fetch');

exports.handler = async function(event) {
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
  const { q, language, sortBy, pageSize } = event.queryStringParameters;
  if (!NEWSAPI_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not set' })
    };
  }
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=${language||'en'}&sortBy=${sortBy||'publishedAt'}&pageSize=${pageSize||5}&apiKey=${NEWSAPI_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
