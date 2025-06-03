const API_KEY = process.env.API_KEY || 'your-secret-api-key';

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

module.exports = authenticate;
