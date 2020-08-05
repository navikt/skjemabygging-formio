import fetch from "node-fetch";

export async function fetchWithErrorHandling(url, options) {
  try {
    const res = await fetch(url, options);

    if (res.ok) {
      return {
        status: "OK",
        data: await res.json(),
      };
    } else if (res.status === 401) {
      return {
        status: "UNAUTHORIZED",
      };
    } else {
      console.error(`Fetch to ${url} failed with status: `, res.status);
      return {
        status: "FAILED"
      }
    }
  } catch (error) {
    console.error(`Fetch to ${url} failed. `, error);
    return {
      status: "FAILED",
    };
  }
}
export function stringTobase64(str) {
  return Buffer.from(str).toString("base64");
}
