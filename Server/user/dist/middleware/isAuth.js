import { User } from "../model/User.js";
import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Please Login - No Auth Header' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken || !decodedToken.id) {
            res.status(401).json({ message: 'Invalid Token' });
            return;
        }
        const user = await User.findById(decodedToken.id);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Please Login - JWT Error' });
        return;
    }
};
