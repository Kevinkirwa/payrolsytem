import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema(
	{
		employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
		date: { type: Date, required: true },
		hours: { type: Number, default: 0 },
		overtimeHours: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

const TimeEntry = mongoose.models.TimeEntry || mongoose.model('TimeEntry', timeEntrySchema);
export default TimeEntry;