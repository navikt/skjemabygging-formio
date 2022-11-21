import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { logger } from "../../logger";
import { getTokenxAccessToken } from "../../security/tokenxHelper";

const pdl = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Fetch PDL");
    try {
      const url = "https://pdl-api.dev-fss-pub.nais.io/graphql";
      // const url = "https://pdl-api.dev.intern.nav.no/graphql";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenxAccessToken(req)}`,
          tema: "AAP",
        },
        body: JSON.stringify({
          query: `
          query($ident: ID!) {
            hentPerson(ident: $ident) {
              navn(historikk: false) {
                fornavn
                mellomnavn
                etternavn
              }
            }
          }
      `,
          variables: {
            ident: "08842748500",
          },
        }),
      });

      const body = await response.json();
      logger.debug(body);
      if (body.errors && body.errors.length > 0) {
        throw new Error(body.errors[0].message);
      }

      res.send(body.data);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  },
};

export default pdl;
