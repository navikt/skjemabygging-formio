const fs = require("fs");
const path = require("path");
const waitOn = require("wait-on");
const axios = require("axios");

async function upsertResource(fhirServer, resource) {
  const { id, resourceType } = resource;
  const resourceUrl = [fhirServer, resourceType, id].join("/");
  const res = await axios.put(resourceUrl, resource);
  console.log(resourceUrl, res.status);
  return res.data;
}

function extractResource(obj) {
  if (obj.resource) {
    return obj.resource;
  } else {
    return obj;
  }
}

async function pushResourcesToHapi(fhirResources) {
  const fhirUrl = process.env.FHIR_SERVER_R4 || "http://hapi:8096/fhir";
  const fhirMetaDataUrl = fhirUrl + "/swagger-ui/";
  console.log("Waiting for " + fhirMetaDataUrl);
  await waitOn({
    resources: [fhirMetaDataUrl],
  });
  for (const resource of fhirResources) {
    await upsertResource(fhirUrl, resource);
  }
}

function findResources(folderName) {
  const resources = [];
  fs.readdirSync(folderName).forEach((fileName) => {
    const pathName = path.join(folderName, fileName);
    const raw = fs.readFileSync(pathName, "utf-8");
    const json = JSON.parse(raw);
    if (Array.isArray(json)) {
      json.forEach((obj) => {
        resources.push(extractResource(obj));
      });
    } else {
      resources.push(extractResource(json));
    }
    console.log("Read content from " + fileName);
  });
  return resources;
}

const folderName = path.join(__dirname, "data");
console.log("Reading resources from folder:", folderName);
pushResourcesToHapi(findResources(folderName))
  .then(() => console.log("Done pushing resources"))
  .catch((e) => {
    console.log(e);
  });
