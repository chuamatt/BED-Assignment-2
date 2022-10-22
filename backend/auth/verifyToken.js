const jwt = require("jsonwebtoken");
const jwtSecret = "secretkey";

var check = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === undefined) {
        res.status(401).send();
        return;
    }
    jwt.verify(authHeader, jwtSecret, { algorithms: ["HS256"] }, (error, decodedToken) => {
        if (error) {
            res.status(401).send();
            return;
        }
        req.decodedToken = decodedToken;
        next();
    });
};
module.exports = check;
