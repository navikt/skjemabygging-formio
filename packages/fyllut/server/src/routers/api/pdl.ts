import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { logger } from "../../logger";
import { getTokenxAccessToken } from "../../security/tokenxHelper";

const pdl = {
  person: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getPerson(getTokenxAccessToken(req), "AAP", "08842748500");

      res.send(data);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  },
  children: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getPersonWithChildren(getTokenxAccessToken(req), "AAP", "02824298087");

      res.send(data);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  },
};

const getPerson = async (tokenxAccessToken: string, theme: string, personId: string) => {
  logger.debug("Fetch person with children.");
  return await pdlRequest(
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
};

const getPersonWithChildren = async (tokenxAccessToken: string, theme: string, personId: string) => {
  logger.debug("Fetch person.");
  return await pdlRequest(
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
            },
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

export default pdl;
