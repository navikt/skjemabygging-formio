import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { Person } from "../../types/person";

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

  return {
    id: personId,
    firstName: person.navn[0].fornavn,
    middleName: person.navn[0].mellomnavn,
    lastName: person.navn[0].etternavn,
  };
};

const getPersonWithRelations = async (
  accessToken: string,
  theme: string,
  personId: string,
  role?: "BARN" | "MOR" | "FAR" // More roles probably exist.
): Promise<Person[]> => {
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
            }
          },            
        }
    `,
      variables: {
        ident: personId,
      },
    })
  );

  logger.debug(JSON.stringify(response.hentPerson));

  const person: PdlPerson = response.hentPerson;

  let children: Person[] = [];
  if (person.forelderBarnRelasjon?.length > 0) {
    for (const relation of person.forelderBarnRelasjon) {
      if (!role || role === relation.relatertPersonsRolle)
        children.push(await getPerson(accessToken, theme, relation.relatertPersonsIdent));
    }
  }

  return children;
};

const pdlRequest = async (accessToken: string, theme: string, query: string) => {
  //const url = "https://pdl-api.prod-fss-pub.nais.io/graphql";
  // TODO: Move to config
  const url = "https://pdl-api.dev-fss-pub.nais.io/graphql";

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
  logger.debug(`User ${idPortenPid} trying to access ${personId}`);
  if (!idPortenPid) {
    throw new Error(`User have to be logged in to access pdl data.`);
  } else if (idPortenPid !== personId) {
    throw new Error(`Logged in user do not match the person they tried to retrieve.`);
  }
};

interface PdlPerson {
  navn: PdlNavn[];
  forelderBarnRelasjon: PdlForelderBarnRelasjon[];
}

interface PdlNavn {
  etternavn: string;
  fornavn: string;
  mellomnavn?: string;
}

interface PdlForelderBarnRelasjon {
  relatertPersonsIdent: string;
  relatertPersonsRolle: string;
}

export default pdl;
