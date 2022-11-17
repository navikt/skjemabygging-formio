import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { logger } from "../../logger";

const pdl = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Fetch PDL");
    try {
      const response = await fetch("https://pdl-api.dev.intern.nav.no/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
