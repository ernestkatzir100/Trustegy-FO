import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  return {
    locale: "he-IL",
    messages: (await import("../../messages/he.json")).default,
  };
});
