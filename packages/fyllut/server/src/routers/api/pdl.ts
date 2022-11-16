import { NextFunction, Request, Response } from "express";

const pdl = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    console.log("Fetch pdl");
    fetch("https://pdl-api.dev.intern.nav.no/graphql", {
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
    })
      .then((response) => {
        console.log(response.json());
        res.send(response.json());
      })
      .then((result) => console.log(result));
  },
};

export default pdl;
