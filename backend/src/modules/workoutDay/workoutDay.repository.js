import { WorkoutDay } from './models/WorkoutDay.model.js';

export class WorkoutDayRepository {
  static async create(data) {
    return WorkoutDay.create(data);
  }

  static async findById(id, gymId) {
    return WorkoutDay.findOne({ _id: id, gymId })
      .populate('exercises.exerciseId', 'name slug muscleGroup thumbnail');
  }

  static async findByTemplateId(workoutTemplateId, gymId) {
    return WorkoutDay.find({ workoutTemplateId, gymId })
      .sort({ dayNumber: 1 })
      .populate('exercises.exerciseId', 'name slug muscleGroup thumbnail');
  }

  static async update(id, gymId, updateData) {
    return WorkoutDay.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async delete(id, gymId) {
    return WorkoutDay.findOneAndDelete({ _id: id, gymId });
  }
}
