import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { config as appConfig } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { Person } from "../../types/person";

const { pdlTokenScopeCluster } = appConfig;

/**
 * Documentation: https://pdldocs-navno.msappproxy.net
 * Test the API: https://pdl-playground.dev.intern.nav.no/editor
 * Test data: https://www.skatteetaten.no/en/forms/tenor-test-data
 */
const pdl = {
  person: async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateLoggedInUser(getIdportenPid(req), req.params.id);
      const data = await getPerson(
        getTokenxAccessToken(req),
        "AAP", // TODO: Use correct theme
        req.params.id
      );
      res.send(data);
    } catch (e) {
      next(e);
    }
  },
  children: async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateLoggedInUser(getIdportenPid(req), req.params.id);
      const data = await getPersonWithRelations(
        req.headers.AzureAccessToken as string,
        "AAP", // TODO: Use correct theme
        req.params.id,
        "BARN"
      );
      res.send(data);
    } catch (e) {
      next(e);
    }
  },
};

const getPerson = async (accessToken: string, theme: string, personId: string): Promise<Person> => {
  logger.debug(`Fetch person from pdl.`);

  const response = await pdlRequest(
    accessToken,
    theme,
    JSON.stringify({
      query: `
        query($ident: ID!) {
          hentPerson(ident: $ident) {
            navn(historikk: false) {
              fornavn
              mellomnavn
              etternavn
            },
            adressebeskyttelse {
              gradering
            },
            bostedsadresse(historikk: false) {
                utenlandskAdresse {                 
                  adressenavnNummer
                  postkode
                  bySted                                    
                  landkode
                }
                vegadresse {
                  adressenavn
                  husnummer
                  husbokstav                  
                  postnummer
                }
            },
            doedsfall {
              doedsdato
            }
          },            
        }
    `,
      variables: {
        ident: personId,
      },
    })
  );

  // TODO: Remove this
  logger.info(JSON.stringify(response.hentPerson));

  const person = response.hentPerson;

  return toPerson(personId, person);
};

const toPerson = (id: string, person: any) => {
  return {
    id,
    ...toName(person),
    ...toDeath(person),
    ...toAddress(person),
  };
};

const toName = (person: any) => {
  const name = person.navn[0];

  return {
    firstName: name.mellomnavn ? `${name.fornavn} ${name.mellomnavn}` : name.fornavn,
    lastName: name.etternavn,
  };
};

const toDeath = (person: any) => {
  const death = person.doedsfall[0];

  if (death?.doedsdato) {
    return {
      deathDate: death.doedsdato,
    };
  }

  return {};
};

const toAddress = (person: any) => {
  const addressProtection = person.adressebeskyttelse[0];
  logger.warn(addressProtection);
  if (addressProtection && addressProtection.gradering === "UGRADERT") {
    return {};
  }

  const address = person.bostedsadresse[0];

  if (address.vegadresse) {
    return {
      streetAddress: address.vegadresse.adressenavn,
      postcode: address.vegadresse.postnummer,
      countryCode: "no",
    };
  } else if (address.utenlandskAdresse) {
    return {
      streetAddress: address.utenlandskAdresse.adressenavnNummer,
      postcode: address.utenlandskAdresse.postkode,
      city: address.utenlandskAdresse.bySted,
      countryCode: address.utenlandskAdresse.landkode,
    };
  }

  return {};
};

const getPersonWithRelations = async (
  accessToken: string,
  theme: string,
  personId: string,
  role?: "BARN" | "MOR" | "FAR" // More roles probably exist.
): Promise<Person[]> => {
  logger.debug(`Fetch person with children from pdl.`);

  let response = await pdlRequest(
    accessToken,
    theme,
    JSON.stringify({
      query: `
        query($ident: ID!) {          
          hentPerson(ident: $ident) {
            navn(historikk: false) {
              fornavn
              mellomnavn
              etternavn
            },
            forelderBarnRelasjon {
              relatertPersonsIdent
              relatertPersonsRolle
            }
          },            
        }
    `,
      variables: {
        ident: personId,
      },
    })
  );

  const person = response.hentPerson;

  let children: Person[] = [];
  if (person.forelderBarnRelasjon?.length > 0) {
    for (const relation of person.forelderBarnRelasjon) {
      if (relation.relatertPersonsIdent && (!role || role === relation.relatertPersonsRolle)) {
        children.push(await getPerson(accessToken, theme, relation.relatertPersonsIdent));
      }
    }
  }

  return children;
};

const pdlRequest = async (accessToken: string, theme: string, query: string) => {
  const url = `https://pdl-api.${pdlTokenScopeCluster}-pub.nais.io/graphql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      tema: theme,
    },
    body: query,
  });

  const body = await response.json();

  if (body.errors?.length > 0) {
    const message = body.errors[0].message;
    if (body.errors[0].extensions?.code === "unauthorized") {
      logger.warn(`User is not authorized to do this pdl request`);
    }

    throw new Error(message);
  }

  return body.data;
};

const validateLoggedInUser = (idPortenPid: string, personId: string) => {
  if (!idPortenPid) {
    throw new Error(`User have to be logged in to access pdl data.`);
  } else if (idPortenPid !== personId) {
    throw new Error(`Logged in user do not match the person they tried to retrieve.`);
  }
};

export default pdl;
