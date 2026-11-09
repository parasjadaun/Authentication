import userModel from '../models/user.model.js';
import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const AuthRouter=express.Router();

AuthRouter.post('/register',AuthController.registerUser);
AuthRouter.get('/me',AuthController.getme);

export default AuthRouter;