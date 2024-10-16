const AppHandleError = require("../util/AppHandleError");

const deverror = (res, err) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err, 
        stack: err.stack 
    });
};

const proderror = (res, err) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error("Error!!", err);
        res.status(500).json({
            status: "error",
            message: "Something went wrong!"
        });
    }
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppHandleError(message, 400);
};
const handleDuplicateFieldsDB= (err)=>{
    const regex = /dup key: {.*?: "(.*?)"/; 
    const val =err.errorResponse.errmsg.match(regex)[1];
    // console.log("from handleDuplicateFieldsDB",val);
    
    const message =`Duplicated field value:${val}. Please use anther one`;
    return new AppHandleError(message,400);
}
const handleValidationErrorDB= (err)=>{
    const errors =Object.values(err.errors).map(el =>el.message)
    // console.log(` error from handleValidationErrorDB${errors}`);
    return new AppHandleError(`invalid input data. ${errors.join(". ")}`,400);
}
const handleJWTError = () => new AppHandleError("Invalid token. Please login again!", 401);

const errorController = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; 
    err.status = err.status || "error";
    // console.log(err);

    if (process.env.NODE_ENV === "development") {
        deverror(res, err);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err, name: err.name, message: err.message };
        // error.message = err.message; 
        if (error.name === "CastError") error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name ==="ValidationError") error =handleValidationErrorDB(error)
        if(error.name ==="JsonWebTokenError") error=handleJWTError();
        proderror(res, error);
    }
};

module.exports  = errorController;
