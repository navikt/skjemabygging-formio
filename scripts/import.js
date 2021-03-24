#!/usr/bin/env node

import fetch from "node-fetch";

const [fromUrl, toApplication, jwtToken] = process.argv.slice(2);

async function main() {
  const response = await fetch(fromUrl);
  const data = await response.json();
  console.log(data);
  const headers = { "x-jwt-token": jwtToken, "content-type": "application/json" };
  const postResponse = await fetch(toApplication + "/form", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });
  const formData = await postResponse.json();
  console.log(formData);
}

const promise = main();
promise.then(() => console.log("done"));
