export const appointmentKeys = {
  all:    ["appointments"] as const,
  list:   () => [...appointmentKeys.all, "list"] as const,
  detail: (id: string) => [...appointmentKeys.all, "detail", id] as const,
};
