class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Capture stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor);
        
        // Add timestamp
        this.timestamp = new Date().toISOString();
    }

    // Method to format error for response
    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            timestamp: this.timestamp,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }
}

export default AppError;