import { ForstesideRequestBody } from "@navikt/skjemadigitalisering-shared-domain";
import nock from "nock";
import { config } from "../../config/config";
import { mockNext, mockRequest, mockResponse } from "../../test/requestTestHelpers";
import forsteside, { validateForstesideRequest } from "./forsteside";
import * as mottaksadresser from "./mottaksadresser";

const { skjemabyggingProxyUrl } = config;

const addresses = [
  {
    _id: "6246de1afd03d2caeeda2825",
    data: {
      adresselinje1: "NAV Arbeid og ytelser lønnsgaranti",
      adresselinje2: "Postboks 6683 St. Olavs Plass",
      adresselinje3: "",
      postnummer: "0129",
      poststed: "Oslo",
      temakoder: "FOS,HJE",
    },
  },
  {
    _id: "61c09f91ec962a0003c65014",
    data: {
      adresselinje1: "NAV Skanning bidrag",
      adresselinje2: "PB 6215 Etterstad",
      adresselinje3: "",
      postnummer: "0603",
      poststed: "Oslo",
    },
  },
];

describe("[endpoint] forsteside", () => {
  beforeAll(() => {
    jest.spyOn(mottaksadresser, "loadMottaksadresser").mockImplementation(async () => addresses);
  });

  it("Create front page", async () => {
    const generateFileMock = nock(skjemabyggingProxyUrl!).post("/foersteside").reply(200, "{}");

    const req = mockRequest({
      headers: {
        AzureAccessToken: "",
      },
      body: {
        foerstesidetype: "ETTERSENDELSE",
        navSkjemaId: "NAV 10.10.10",
        spraakkode: "NB",
        overskriftstittel: "Tittel",
        arkivtittel: "Tittel",
        tema: "HJE",
      },
    });

    await forsteside.post(req, mockResponse(), mockNext());

    expect(generateFileMock.isDone()).toBe(true);
  });

  describe("validateForstesideRequest", () => {
    it("Find address if no address and theme is set on existing address", async () => {
      const body = await validateForstesideRequest({
        tema: "HJE",
      } as ForstesideRequestBody);

      expect(body.netsPostboks).toBeUndefined();
      expect(body.adresse).not.toBeUndefined();
    });

    it("If theme is set not on existing address, use default netsPostboks", async () => {
      const body = await validateForstesideRequest({
        tema: "HJR",
      } as ForstesideRequestBody);

      expect(body.netsPostboks).not.toBeUndefined();
      expect(body.adresse).toBeUndefined();
    });

    it("Set default netsPostboks if not set", async () => {
      const body = await validateForstesideRequest({} as ForstesideRequestBody);

      expect(body.netsPostboks).toBe("1400");
    });

    it("Do not overide netsPostboks if set", async () => {
      const body = await validateForstesideRequest({
        netsPostboks: "1300",
      } as ForstesideRequestBody);

      expect(body.netsPostboks).toBe("1300");
    });

    it("Change nb-NO", async () => {
      const body = await validateForstesideRequest({
        spraakkode: "nb-NO",
      } as ForstesideRequestBody);

      expect(body.spraakkode).toBe("NB");
    });

    it("Change nb-NN", async () => {
      const body = await validateForstesideRequest({
        spraakkode: "nn-NO",
      } as ForstesideRequestBody);

      expect(body.spraakkode).toBe("NN");
    });

    it("Change nn to uppercase", async () => {
      const body = await validateForstesideRequest({
        spraakkode: "nn",
      } as ForstesideRequestBody);

      expect(body.spraakkode).toBe("NN");
    });
  });
});
