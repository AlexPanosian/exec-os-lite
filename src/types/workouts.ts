export type WorkoutType = 'push' | 'pull' | 'cardio'

export interface Workout {
  id: string
  user_id: string
  created_at: string
  type: WorkoutType
  completed: boolean
}

export interface CreateWorkoutInput {
  type: WorkoutType
  completed?: boolean
}

export interface UpdateWorkoutInput {
  completed?: boolean
  type?: WorkoutType
}