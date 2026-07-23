import createError from 'http-errors';
import { WorkoutRepository } from './workout.repository.js';
import { WorkoutDay } from '../workoutDay/models/WorkoutDay.model.js';
import { assertWorkoutOwnership } from './workout.auth.js';

export class WorkoutService {
  static async createWorkout(gymId, user, data) {
    const { days = [], ...workoutData } = data;
    const workout = await WorkoutRepository.create({
      gymId,
      createdBy: user._id,
      ...workoutData,
    });

    if (days.length > 0) {
      const dayDocs = days.map(day => ({
        workoutId: workout._id,
        orderIndex: day.orderIndex,
        dayName: day.dayName,
        title: day.title,
        exercises: (day.exercises || []).map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          duration: ex.duration,
          restTime: ex.restTime,
          notes: ex.notes,
          order: ex.order,
          exerciseId: ex.exerciseId,
          image: ex.image,
          videoUrl: ex.videoUrl,
        })),
      }));
      await WorkoutDay.insertMany(dayDocs);
    }

    const createdDays = await WorkoutDay.find({ workoutId: workout._id }).sort({ orderIndex: 1 });
    return { ...workout.toObject(), days: createdDays };
  }

  static async getWorkouts(gymId, query = {}, _user) {
    const { search, status, sort, order } = query;
    return WorkoutRepository.findAll(gymId, { search, status, sort, order });
  }

  static async getWorkoutById(id, gymId, _user) {
    const workout = await WorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    const days = await WorkoutDay.find({ workoutId: workout._id }).sort({ orderIndex: 1 });

    return { ...workout.toObject(), days };
  }

  static async updateWorkout(id, gymId, data, user) {
    const workout = await WorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    const updated = await WorkoutRepository.update(id, gymId, data);
    if (!updated) throw createError.NotFound('Workout not found');
    return updated;
  }

  static async deleteWorkout(id, gymId, user) {
    const workout = await WorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    const deleted = await WorkoutRepository.softDelete(id, gymId);
    if (!deleted) throw createError.NotFound('Workout not found');
    return deleted;
  }

  static async duplicateWorkout(id, gymId, userId, _user) {
    const workout = await WorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    const existingNames = await WorkoutRepository.findByOriginalName(gymId, workout.title);
    const existingTitles = existingNames.map(w => w.title);
    const copyName = getCopyName(workout.title, existingTitles);

    const duplicated = await WorkoutRepository.create({
      gymId,
      title: copyName,
      description: workout.description,
      goal: workout.goal,
      estimatedDuration: workout.estimatedDuration,
      category: workout.category,
      status: workout.status,
      createdBy: userId,
    });

    const days = await WorkoutDay.find({ workoutId: workout._id }).sort({ orderIndex: 1 });
    if (days.length > 0) {
      const dayDocs = days.map(day => ({
        workoutId: duplicated._id,
        orderIndex: day.orderIndex,
        dayName: day.dayName,
        title: day.title,
        exercises: day.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          duration: ex.duration,
          restTime: ex.restTime,
          notes: ex.notes,
          order: ex.order,
          exerciseId: ex.exerciseId,
          image: ex.image,
          videoUrl: ex.videoUrl,
        })),
      }));
      await WorkoutDay.insertMany(dayDocs);
    }

    const newDays = await WorkoutDay.find({ workoutId: duplicated._id }).sort({ orderIndex: 1 });
    return { ...duplicated.toObject(), days: newDays };
  }

  static async archiveWorkout(id, gymId, user) {
    const workout = await WorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    const updated = await WorkoutRepository.update(id, gymId, { status: 'ARCHIVED' });
    if (!updated) throw createError.NotFound('Workout not found');
    return updated;
  }

  static async saveNested(gymId, workoutId, data, user) {
    const { days: incomingDays, ...workoutData } = data;

    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    const updatedWorkout = await WorkoutRepository.update(workoutId, gymId, workoutData);
    if (!updatedWorkout) throw createError.NotFound('Workout not found');

    const existingDays = await WorkoutDay.find({ workoutId: updatedWorkout._id }).select('_id');
    const existingIds = existingDays.map(d => d._id.toString());
    const incomingIds = incomingDays.filter(d => d._id).map(d => d._id);

    const toDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (toDelete.length > 0) {
      await WorkoutDay.deleteMany({ _id: { $in: toDelete }, workoutId: updatedWorkout._id });
    }

    for (const day of incomingDays) {
      if (day._id && existingIds.includes(day._id)) {
        const { _id, ...dayData } = day;
        const existingExercises = (await WorkoutDay.findById(_id).select('exercises'))?.exercises || [];

        const incomingExerciseIds = (dayData.exercises || []).filter(e => e._id).map(e => e._id);
        const filteredExercises = existingExercises.filter(e => {
          const eStr = e._id ? e._id.toString() : null;
          return !eStr || incomingExerciseIds.includes(eStr);
        });

        const updatedExercises = (dayData.exercises || []).map(e => {
          if (!e._id) return e;
          const existing = filteredExercises.find(fe => fe._id && fe._id.toString() === e._id);
          return existing ? { ...existing.toObject(), ...e } : e;
        });

        await WorkoutDay.findByIdAndUpdate(
          _id,
          { ...dayData, exercises: updatedExercises },
          { new: true, runValidators: true }
        );
      } else {
        const { _id, ...dayData } = day;
        await WorkoutDay.create({
          ...dayData,
          workoutId: updatedWorkout._id,
        });
      }
    }

    const days = await WorkoutDay.find({ workoutId: updatedWorkout._id }).sort({ orderIndex: 1 });
    return { ...updatedWorkout.toObject(), days };
  }

  static async getWorkoutsForMember(gymId, memberId) {
    const { MemberRepository } = await import('../member/member.repository.js');
    const { Member } = await import('../member/models/Member.model.js');
    const member = await MemberRepository.findById(memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    const workouts = await WorkoutRepository.findForMember(gymId, member._id);

    const workoutIds = workouts.map((w) => w._id);
    const allDays = await WorkoutDay.find({ workoutId: { $in: workoutIds } }).sort({ orderIndex: 1 });

    return workouts.map((workout) => ({
      ...workout.toObject(),
      days: allDays.filter((d) => d.workoutId.toString() === workout._id.toString()),
    }));
  }
}

function getCopyName(originalName, existingNames) {
  if (!existingNames.includes(`${originalName} (Copy)`)) {
    return `${originalName} (Copy)`;
  }
  let counter = 2;
  while (existingNames.includes(`${originalName} (Copy ${counter})`)) {
    counter++;
  }
  return `${originalName} (Copy ${counter})`;
}
