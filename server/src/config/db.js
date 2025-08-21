import mongoose from 'mongoose';

export async function connectDatabase() {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		console.warn('[DB] MONGODB_URI is not set. Server will start without a DB connection.');
		return;
	}

	mongoose.set('strictQuery', true);
	try {
		await mongoose.connect(mongoUri, {
			// connection options can be added here if needed
		});
		console.log('[DB] Connected to MongoDB');
	} catch (error) {
		console.error('[DB] MongoDB connection error:', error.message);
		process.exit(1);
	}
}