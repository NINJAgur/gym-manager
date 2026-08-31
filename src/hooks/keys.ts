export const qk = {
  assigned: (traineeId: string) => ['assigned', traineeId] as const,
  history: (traineeId: string, exerciseId: string) => ['history', traineeId, exerciseId] as const,
  trainees: () => ['trainees'] as const,
  masterExercises: () => ['exercises'] as const,
  exercise: (id: string) => ['exercise', id] as const,
};
