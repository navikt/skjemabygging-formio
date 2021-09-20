const form = {
  "_id": "61405cb95dbf1200033aa272",
  "type": "form",
  "tags": ["nav-skjema", ""],
  "owner": "606ea4ab852cf50003ac20d3",
  "components": [],
  "display": "wizard",
  "name": "wip123456",
  "title": "Søknad om førerhund",
  "path": "wip123456",
  "properties": {
    "skjemanummer": "WIP 12.34-56"
  },
  "machineName": "wip123456"
};
const translations = {
  "en": {
    "id": "1",
    "translations": {
      [`${form.title}`]: {scope: "local", value: "Application for guide dog"},
    }
  },
  "nn-NO": {
    "id": "2",
    "translations": {
      [`${form.title}`]: {scope: "local", value: "Søknad om førarhund"},
    }
  }
};

export {form, translations};
