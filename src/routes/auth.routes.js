import userModel from '../models/user.model.js';
import express from 'express';
import * as AuthController from '../controllers/auth.controller.js';

const AuthRouter=express.Router();

/**Post request to register a new user */
AuthRouter.post('/register',AuthController.registerUser);
/**Post request to login a user */
AuthRouter.post('/login',AuthController.login);
/**Get request to get the current user */
AuthRouter.get('/me',AuthController.getme);

AuthRouter.get('/Rotate-Tokens',AuthController.RefreshToken);
AuthRouter.get('/logout',AuthController.logout);
AuthRouter.get('/logout-all',AuthController.logOutAll);

AuthRouter.post('/verify-otp',AuthController.verifyEmail);

export default AuthRouter;