import nock from "nock";
import { mockRequest, mockResponse } from "../../test/testHelpers";
import { base64Decode } from "../../utils/base64";
import exstream from "./exstream";

describe("exstream", () => {
  const defaultBody = {
    form: JSON.stringify({ components: [], properties: { skjemanummer: "NAV 12.34-56" } }),
    submission: JSON.stringify({ data: {} }),
    submissionMethod: "paper",
    translations: JSON.stringify({}),
    language: "nb-NO",
  };

  it("decodes and sends the pdf on success", async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post("/exstream")
      .reply(200, { data: { result: [{ content: { data: "base64EncodedPDFstring" } }] } });
    const req = mockRequest({ headers: { AzureAccessToken: "azure-access-token" }, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await exstream.post(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(base64Decode("base64EncodedPDFstring"));
    skjemabyggingproxyScope.done();
  });

  it("calls next if skjemabygging-proxy returns error", async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post("/exstream")
      .reply(500, "error body");
    const req = mockRequest({ headers: { AzureAccessToken: "azure-access-token" }, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await exstream.post(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as Error;
    expect(error?.message).toBe("Feil ved generering av PDF hos Exstream");
    expect(res.send).not.toHaveBeenCalled();
    skjemabyggingproxyScope.done();
  });
});
