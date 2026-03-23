import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Please Login - No Auth Header' })
            return
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        if (!decodedToken || !decodedToken.id) {
            res.status(401).json({ message: 'Invalid Token' });
            return;
        }

        req.user = { _id: decodedToken.id, email: decodedToken.email } as IUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please Login - JWT Error' });
        return;
    }
}

export default isAuth;