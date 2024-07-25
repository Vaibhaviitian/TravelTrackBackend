const asynchandler = (requesthandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requesthandler(req, res, next))
            .catch(next); // Corrected the error handlin
    };
};

export default asynchandler;
