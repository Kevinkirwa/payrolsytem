import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './config/db.js';
import apiRouter from './routes/index.js';
import rateLimit from 'express-rate-limit';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);

app.use('/api', apiRouter);

app.use((req, res) => {
	res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
	console.error('[ERR]', err);
	res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 4000;

connectDatabase()
	.then(() => {
		app.listen(port, () => {
			console.log(`[HTTP] Server running on port ${port}`);
		});
	})
	.catch((err) => {
		console.error('[Startup] DB connection failed:', err);
		process.exit(1);
	});