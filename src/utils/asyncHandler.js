const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch
        ((err) => next(err))
    }
}

export {asyncHandler}


/*
simplify error handling for asynchronous route handlers
we dont need to use try...catch for errors


Promise -> object that represents the eventual result(success or failure) 
            of an asynchronous operation.
async/await -> async/await is a cleaner, more readable way to work with Promises.
                async makes a function return a Promise.
                await pauses execution until a Promise is resolved/rejected.
*/