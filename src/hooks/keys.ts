export const qk = {
  programs: (traineeId: string) => ['programs', traineeId] as const,
  history: (traineeId: string, exerciseId: string) => ['history', traineeId, exerciseId] as const,
  trainees: () => ['trainees'] as const,
  exercises: () => ['exercises'] as const,
  exercise: (id: string) => ['exercise', id] as const,
};
