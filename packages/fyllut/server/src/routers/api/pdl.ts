import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { logger } from "../../logger";
import { getTokenxAccessToken } from "../../security/tokenxHelper";
import { Person } from "../../types/person";

const pdl = {
  person: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getPerson(getTokenxAccessToken(req), "AAP", req.params.id);

      res.send(data);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  },
  children: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getChildren(getTokenxAccessToken(req), "AAP", req.params.id);

      res.send(data);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  },
};

const getPerson = async (tokenxAccessToken: string, theme: string, personId: string): Promise<Person> => {
  logger.debug(`Fetch ${personId} from pdl.`);

  const response = await pdlRequest(
    tokenxAccessToken,
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

  const person: Person = response.hentPerson;

  return {
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
  };
};

const getChildren = async (tokenxAccessToken: string, theme: string, personId: string): Promise<Person[]> => {
  logger.debug(`Fetch ${personId} with children from pdl.`);

  const person: PdlPerson = await pdlRequest(
    tokenxAccessToken,
    theme,
    JSON.stringify({
      query: `
        query($ident: ID!) {
          hentPerson(ident: $ident) {            
            forelderBarnRelasjon {
              relatertPersonsIdent              
            }
          },            
        }
    `,
      variables: {
        ident: personId,
      },
    })
  );

  let children: Person[] = [];
  if (person.forelderBarnRelasjon?.length > 0) {
    for (const child of person.forelderBarnRelasjon) {
      children.push(await getPerson(tokenxAccessToken, theme, child.relatertPersonsIdent));
    }
  }

  return children;
};

const pdlRequest = async (tokenxAccessToken: string, theme: string, query: string) => {
  const url = "https://pdl-api.dev-fss-pub.nais.io/graphql";
  // const url = "https://pdl-api.dev.intern.nav.no/graphql";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenxAccessToken}`,
      tema: theme,
    },
    body: query,
  });

  const body = await response.json();

  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors[0].message);
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
  mellomnavn: string;
  gyldigFraOgMed: string;
}

interface PdlForelderBarnRelasjon {
  relatertPersonsIdent: string;
}

export default pdl;
