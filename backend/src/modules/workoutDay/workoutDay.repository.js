import mongoose from 'mongoose';
import { WorkoutDay } from './models/WorkoutDay.model.js';

export class WorkoutDayRepository {
  static async create(data) {
    return WorkoutDay.create(data);
  }

  static async findByWorkoutId(workoutId) {
    return WorkoutDay.find({ workoutId }).sort({ orderIndex: 1 });
  }

  static async findById(id, workoutId) {
    const query = { workoutId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return WorkoutDay.findOne(query);
  }

  static async update(id, workoutId, data) {
    const query = { workoutId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return WorkoutDay.findOneAndUpdate(
      query,
      data,
      { new: true, runValidators: true }
    );
  }

  static async delete(id, workoutId) {
    const query = { workoutId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return WorkoutDay.findOneAndDelete(query);
  }
}
