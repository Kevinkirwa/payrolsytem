import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
	{
		kraTokenUrl: { type: String, default: '' },
		submitP10Url: { type: String, default: '' },
		submitP10AUrl: { type: String, default: '' },
		submitP9Url: { type: String, default: '' },
		employerPin: { type: String, default: '' },
		branch: { type: String, default: '' },
		obligationCodes: { type: Object, default: {} }
	},
	{ timestamps: true }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings;