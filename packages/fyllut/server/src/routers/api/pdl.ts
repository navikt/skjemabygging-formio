import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import qs from "qs";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getTokenxAccessToken } from "../../security/tokenxHelper";
import { Person } from "../../types/person";

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const pdl = {
  person: async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug(req.headers.AzureAccessToken);
      const data = await getPerson(req.getIdportenJwt(), "AAP", req.params.id);
      res.send(data);
    } catch (e) {
      next(e);
    }
  },
  children: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getChildren(getTokenxAccessToken(req), "AAP", req.params.id);
      res.send(data);
    } catch (e) {
      next(e);
    }
  },
};

const getPerson = async (accessToken: string, theme: string, personId: string): Promise<Person> => {
  logger.debug(`Fetch ${personId} from pdl.`);

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
            }
          },            
        }
    `,
      variables: {
        ident: personId,
      },
    })
  );

  const person: PdlPerson = response.hentPerson;

  logger.debug(`${person.navn[0].fornavn} gyldig ${person.navn[0].gyldigFraOgMed}`);

  return {
    id: personId,
    firstName: person.navn[0].fornavn,
    middleName: person.navn[0].mellomnavn,
    lastName: person.navn[0].etternavn,
  };
};

const getChildren = async (accessToken: string, theme: string, personId: string): Promise<Person[]> => {
  logger.debug(`Fetch ${personId} with children from pdl.`);

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
              minRolleForPerson    
              folkeregistermetadata
              metadata          
            }
          },            
        }
    `,
      variables: {
        ident: personId,
      },
    })
  );

  const person: PdlPerson = response.hentPerson;

  logger.debug(JSON.stringify(person));

  let children: Person[] = [];
  /*if (person.forelderBarnRelasjon?.length > 0) {
    for (const child of person.forelderBarnRelasjon) {
      children.push(await getPerson(tokenxAccessToken, theme, child.relatertPersonsIdent));
    }
  }*/

  return children;
};

const getPdlAccessToken = async (token: string) => {
  return fetch(azureOpenidTokenEndpoint!, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: qs.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: clientId,
      client_secret: clientSecret,
      assertion: token,
      scope: "api:/dev-fss.pdl.pdl-api/.default",
      requested_token_use: "on_behalf_of",
    }),
  })
    .then((response) => {
      logger.debug(`Client id: ${clientId}`);
      logger.debug(`Token: ${token}`);
      logger.debug(`Response: ${qs.stringify(response)}`);
      if (response.ok) {
        const data = response.json();
        logger.debug("Ok");
        logger.debug(qs.stringify(data));
        // @ts-ignore
        return data.access_token;
      } else {
        logger.debug("Error");
      }
    })
    .catch((error) => {
      logger.debug("PDL access token failed");
      logger.debug(qs.stringify(error));
    });
};

const pdlRequest = async (accessToken: string, theme: string, query: string) => {
  //const url = "https://pdl-api.prod-fss-pub.nais.io/graphql";
  const url = "https://pdl-api.dev-fss-pub.nais.io/graphql";
  const pdlAccessToken = await getPdlAccessToken(accessToken);
  logger.debug("pdlAccessToken");
  logger.debug(pdlAccessToken);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pdlAccessToken}`,
      tema: theme,
    },
    body: query,
  });

  const body = await response.json();

  if (body.errors?.length > 0) {
    const message = body.errors[0].message;
    if (body.errors[0].extensions?.code === "unauthorized") {
      // TODO: Handle unauthorized
    }

    throw new Error(message);
  }

  return body.data;
};

interface PdlPerson {
  navn: PdlNavn[];
  forelderBarnRelasjon: PdlForelderBarnRelasjon[];
}

interface PdlNavn {
  etternavn: string;
  fornavn: string;
  mellomnavn?: string;
  gyldigFraOgMed?: string;
}

interface PdlForelderBarnRelasjon {
  relatertPersonsIdent: string;
}

export default pdl;
