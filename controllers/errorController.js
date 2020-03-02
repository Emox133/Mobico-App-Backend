const AppError = require('./../utils/AppError');

// !DEVELOPMENT ENVIROMENT
const sendDevErrors = (err, res) => {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  };

  // !HANDLE DIFFERRENT ERROR TYPES
  const handleCastError = err => {
    const message = `Invalid ${err.pat}: ${err.value}`;
    return new AppError(message, 400);
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

      sendProdErrors(error, res);
    }
  };

