// Shared query key factory — no "use client", safe to import from server and client
export const propertyKeys = {
  all:      ["properties"] as const,
  infinite: (filters?: object) => ["properties", "infinite", filters ?? {}] as const,
  detail:   (id: string)      => ["property", id] as const,
};

export const PAGE_LIMIT = 12;
