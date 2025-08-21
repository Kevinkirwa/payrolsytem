import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		phone: { type: String },
		role: { type: String, enum: ['admin', 'employee'], default: 'employee', index: true },
		password: { type: String, required: true, select: false },
		isActive: { type: Boolean, default: true },
		permissions: { type: [String], default: [] }
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;