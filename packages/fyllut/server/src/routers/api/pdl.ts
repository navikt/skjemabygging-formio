import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { logger } from "../../logger";
import { Person } from "../../types/person";

const pdl = {
  person: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Validate req.params.id against logged inn user token. And only let logged inn users call this.
      const data = await getPerson(req.headers.AzureAccessToken as string, "AAP", req.params.id);
      res.send(data);
    } catch (e) {
      next(e);
    }
  },
  children: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getChildren(req.headers.AzureAccessToken as string, "AAP", req.params.id);
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
    for (const child of person.forelderBarnRelasjon) {
      children.push(await getPerson(accessToken, theme, child.relatertPersonsIdent));
    }
  }

  return children;
};

const pdlRequest = async (accessToken: string, theme: string, query: string) => {
  //const url = "https://pdl-api.prod-fss-pub.nais.io/graphql";
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
