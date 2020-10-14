import fetch from "node-fetch";

export async function fetchWithErrorHandling(url, options) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      if (res.status === 204) {
        return {
          status: "OK",
          data: null
        }
      }
      return {
        status: "OK",
        data: await res.json(),
      };
    } else if (res.status === 401) {
      return {
        status: "UNAUTHORIZED",
      };
    } else {
      console.error(`Fetch ${options.method || 'GET'} ${url} failed with status: `, res.status);
      console.error(`${options.method} body`, options.body);
      return {
        status: "FAILED"
      }
    }
  } catch (error) {
    console.error(`Fetch ${options.method || 'GET'} ${url} failed`, error);
    return {
      status: "FAILED",
    };
  }
}
export function stringTobase64(str) {
  return Buffer.from(str).toString("base64");
}

export function base64ToString(base64) {
  return Buffer.from(base64, 'base64').toString();
}
