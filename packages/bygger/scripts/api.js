#!/usr/bin/env node

import fetch from "node-fetch";

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const args = process.argv.slice(2);
async function loginUser(email, password) {
  const loginBody = {
    data: {
      email: email,
      password: password,
    },
  };
  const loginResponse = await fetch("https://formio-api-server.dev.nav.no/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginBody),
  });
  const token = loginResponse.headers.get("x-jwt-token");
  return token;
}

async function getForm() {
  const token = await loginUser(args[0], args[1]);
  const response = await fetch("https://formio-api-server.dev.nav.no/form/" + args[3], {
    method: "GET",
    headers: { "x-jwt-token": token },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const formData = await response.json();
  process.stdout.write(JSON.stringify(formData, null, 2));
  process.stdout.write("\n");
}

async function putForm() {
  const token = await loginUser(args[0], args[1]);
  const inputData = await read(process.stdin);
  const inputForm = JSON.parse(inputData);

  const response = await fetch("https://formio-api-server.dev.nav.no/form/" + args[3], {
    method: "PUT",
    headers: { "x-jwt-token": token, "content-type": "application/json" },
    body: JSON.stringify(inputForm),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const formData = await response.json();
  process.stdout.write(JSON.stringify(formData, null, 2));
  process.stdout.write("\n");
}

if (args[2] === "PUT") {
  putForm();
} else if (args[2] === "GET") {
  getForm();
} else {
  process.stderr.write("Usage: api.js <username> <password> <method> <id>\n");
}
