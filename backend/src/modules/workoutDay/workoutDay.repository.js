import { WorkoutDay } from './models/WorkoutDay.model.js';

export class WorkoutDayRepository {
  static async create(data) {
    return WorkoutDay.create(data);
  }

  static async findByWorkoutId(workoutId) {
    return WorkoutDay.find({ workoutId }).sort({ dayNumber: 1 });
  }

  static async findById(id, workoutId) {
    return WorkoutDay.findOne({ _id: id, workoutId });
  }

  static async update(id, workoutId, data) {
    return WorkoutDay.findOneAndUpdate(
      { _id: id, workoutId },
      data,
      { new: true, runValidators: true }
    );
  }

  static async delete(id, workoutId) {
    return WorkoutDay.findOneAndDelete({ _id: id, workoutId });
  }
}
