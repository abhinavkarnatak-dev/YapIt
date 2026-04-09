import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = "";
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.query.token) {
            token = req.query.token;
        }
        if (!token) {
            res.status(401).json({ message: 'Please Login - No Auth Token' });
            return;
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken || !decodedToken.id) {
            res.status(401).json({ message: 'Invalid Token' });
            return;
        }
        req.user = { _id: decodedToken.id, email: decodedToken.email };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Please Login - JWT Error' });
        return;
    }
};
export default isAuth;
