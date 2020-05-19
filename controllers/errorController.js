const AppError = require('./../utils/AppError');

// !DEVELOPMENT ENVIROMENT
const sendDevErrors = (err, res) => {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      // stack: err.stack
    });
  };

  // !HANDLE DIFFERRENT ERROR TYPES
  const handleCastError = err => {
    const message = `Invalid ${err.pat}: ${err.value}`;
    return new AppError(message, 400);
  };

  const handleDuplicateKeys = err => {
    const value = err.errmsg.match(/'[^'"]*'(?=(?:[^"]*"[^"]*")*[^"]*$)/g);
    const message = `Duplicate key found ${value}. Please use another value.`;
    return new AppError(message, 400);
  };

  const handleJWTExpired = () => {
    return new AppError('Your token has expired. Please log in again.', 401);
  };

// !PRORDUCTION ENVIROMENT
const sendProdErrors = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        res.status(500).json({
            message: 'Something went wrong 😢'
        })
    }
};

module.exports = (err, req, res, next) => {  
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.MODE === 'development') {
      sendDevErrors(err, res);
    } else if (process.env.MODE === 'production') {
      let error = {...err};

      if(error.name === 'CastError') error = handleCastError(error);
      if(error.code === 11000) error = handleDuplicateKeys(error);
      if(error.name === 'TokenExpiredError') handleJWTExpired();

      sendProdErrors(error, res);
    }
  };

