import { Request,NextFunction, Response } from "express";
import { IUser } from "../model/User.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if(!decodedToken || !decodedToken.user){
            res.status(401).json({ message: 'Invalid Token' });
            return;
        }
        req.user = decodedToken as IUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid Token' });
        return;
    }
}
