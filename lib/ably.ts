import * as Ably from "ably";

export const createAblyClient = async () => {
  const client = new Ably.Realtime({
    authUrl: "/api/ably/token",
  });

  return client;
};
