import createError from 'http-errors';
import mongoose from 'mongoose';
import { MemberWorkoutPlanRepository } from './memberWorkoutPlan.repository.js';
import { MemberWorkoutPlanDay } from './models/MemberWorkoutPlanDay.model.js';
import { TrainerRepository } from '../trainer/trainer.repository.js';
import { Workout } from '../workouts/models/Workout.model.js';
import { WorkoutDay } from '../workoutDay/models/WorkoutDay.model.js';
import { ROLES } from '../../shared/constants.js';

export class MemberWorkoutPlanService {
  static async createPlan(gymId, userId, data) {
    const { memberId, trainerId, sourceWorkoutId, title, description, goal, estimatedDuration, category } = data;

    const trainer = await TrainerRepository.findProfileById(trainerId, gymId);
    if (!trainer) throw createError.NotFound('Trainer not found');

    const isAssigned = await TrainerRepository.findActiveAssignments(gymId, trainer._id, [memberId]);
    if (isAssigned.length === 0) {
      throw createError.Forbidden('Trainer is not assigned to this member');
    }

    if (sourceWorkoutId) {
      const source = await Workout.findById(sourceWorkoutId).lean();
      if (!source || source.gymId.toString() !== gymId.toString()) {
        throw createError.BadRequest('Source workout not found or does not belong to this gym');
      }
      if (source.status !== 'ACTIVE') {
        throw createError.BadRequest('Cannot clone a non-ACTIVE workout template');
      }

      const safeTitle = title || `${source.title} (Personalized)`;
      const plan = await MemberWorkoutPlanRepository.create({
        gymId,
        memberId,
        trainerId: trainer._id,
        sourceWorkoutId: source._id,
        title: safeTitle,
        description: description || source.description,
        goal: goal || source.goal,
        estimatedDuration: estimatedDuration || source.estimatedDuration,
        category: category || source.category,
        status: 'ACTIVE',
        createdBy: userId,
      });

      const sourceDays = await WorkoutDay.find({ workoutId: source._id }).sort({ orderIndex: 1 });
      if (sourceDays.length > 0) {
        const dayDocs = sourceDays.map((day) => ({
          planId: plan._id,
          orderIndex: day.orderIndex,
          dayName: day.dayName,
          title: day.title,
          exercises: day.exercises.map((ex) => ({
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
        await MemberWorkoutPlanDay.insertMany(dayDocs);
      }

      const days = await MemberWorkoutPlanDay.find({ planId: plan._id }).sort({ orderIndex: 1 });
      return { ...plan.toObject(), days };
    }

    const plan = await MemberWorkoutPlanRepository.create({
      gymId,
      memberId,
      trainerId: trainer._id,
      sourceWorkoutId: null,
      title: title || 'Untitled Plan',
      description,
      goal,
      estimatedDuration,
      category,
      status: 'ACTIVE',
      createdBy: userId,
    });

    return { ...plan.toObject(), days: [] };
  }

  static async getPlans(gymId, query) {
    return MemberWorkoutPlanRepository.findAll(gymId, query);
  }

  static async getPlansByTrainer(gymId, trainerId, query) {
    return MemberWorkoutPlanRepository.findByTrainer(gymId, trainerId, query);
  }

  static async getPlansByMember(gymId, memberId, query) {
    return MemberWorkoutPlanRepository.findByMember(gymId, memberId, query);
  }

  static async getPlanById(id, gymId) {
    const plan = await MemberWorkoutPlanRepository.findById(id, gymId);
    if (!plan) throw createError.NotFound('Workout plan not found');

    const days = await MemberWorkoutPlanDay.find({ planId: plan._id }).sort({ orderIndex: 1 });
    return { ...plan, days };
  }

  static async updatePlan(id, gymId, data) {
    const plan = await MemberWorkoutPlanRepository.findById(id, gymId);
    if (!plan) throw createError.NotFound('Workout plan not found');

    const allowed = {};
    if (data.title !== undefined) allowed.title = data.title;
    if (data.description !== undefined) allowed.description = data.description;
    if (data.goal !== undefined) allowed.goal = data.goal;
    if (data.estimatedDuration !== undefined) allowed.estimatedDuration = data.estimatedDuration;
    if (data.category !== undefined) allowed.category = data.category;
    if (data.status !== undefined) allowed.status = data.status;
    if (Object.keys(allowed).length > 0) {
      allowed.updatedBy = data.updatedBy;
    }

    const updated = await MemberWorkoutPlanRepository.update(id, gymId, allowed);
    if (!updated) throw createError.NotFound('Workout plan not found');
    return updated;
  }

  static async archivePlan(id, gymId, userId) {
    const plan = await MemberWorkoutPlanRepository.findById(id, gymId);
    if (!plan) throw createError.NotFound('Workout plan not found');
    return MemberWorkoutPlanRepository.archive(id, gymId, userId);
  }

  static async saveNested(gymId, planId, data) {
    const plan = await MemberWorkoutPlanRepository.findById(planId, gymId);
    if (!plan) throw createError.NotFound('Workout plan not found');

    const { days: incomingDays, ...planData } = data;

    const updatedPlan = await MemberWorkoutPlanRepository.update(planId, gymId, planData);

    const existingDays = await MemberWorkoutPlanDay.find({ planId: updatedPlan._id }).select('_id');
    const existingIds = existingDays.map((d) => d._id.toString());
    const incomingIds = incomingDays.filter((d) => d._id).map((d) => d._id);

    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
    if (toDelete.length > 0) {
      await MemberWorkoutPlanDay.deleteMany({ _id: { $in: toDelete }, planId: updatedPlan._id });
    }

    for (const day of incomingDays) {
      if (day._id && existingIds.includes(day._id)) {
        const { _id, ...dayData } = day;
        const existingExercises = (await MemberWorkoutPlanDay.findById(_id).select('exercises'))?.exercises || [];

        const incomingExerciseIds = (dayData.exercises || []).filter((e) => e._id).map((e) => e._id);
        const filteredExercises = existingExercises.filter((e) => {
          const eStr = e._id ? e._id.toString() : null;
          return !eStr || incomingExerciseIds.includes(eStr);
        });

        const updatedExercises = (dayData.exercises || []).map((e) => {
          if (!e._id) return e;
          const existing = filteredExercises.find((fe) => fe._id && fe._id.toString() === e._id);
          return existing ? { ...existing.toObject(), ...e } : e;
        });

        await MemberWorkoutPlanDay.findByIdAndUpdate(
          _id,
          { ...dayData, exercises: updatedExercises },
          { new: true, runValidators: true }
        );
      } else {
        const { _id, ...dayData } = day;
        await MemberWorkoutPlanDay.create({
          ...dayData,
          planId: updatedPlan._id,
        });
      }
    }

    const days = await MemberWorkoutPlanDay.find({ planId: updatedPlan._id }).sort({ orderIndex: 1 });
    return { ...updatedPlan, days };
  }
}
