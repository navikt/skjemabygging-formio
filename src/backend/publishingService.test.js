import * as publishingService from "./publishingService";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { jsonToPromise, createBackendForTest } from "../testTools/backend/testUtils";
jest.mock("node-fetch");

describe("checkPublishingAccess", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it("calls given URL with correct parameters", async () => {
    fetch.mockReturnValue(jsonToPromise({ current: "Test McTestersen" }));

    let token = "testtoken";
    let projectUrl = "testUrl";

    await publishingService.checkPublishingAccess(token, projectUrl);

    expect(fetch).toHaveBeenCalledWith(`${projectUrl}/current`, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": token,
      },
    });
  });
});

describe("getGithubToken", () => {
  const backend = createBackendForTest();
  let spyJwt;

  const fakeJwtToken = "fakeJsonWebToken";
  beforeEach(() => {
    fetch.mockReset();
    fetch.mockReturnValue(jsonToPromise({ token: "1234567890qwertyuiop" }));
    spyJwt = jest.spyOn(jwt, "sign").mockImplementation(() => fakeJwtToken);
  });

  it("Creates a jwtToken from key", async () => {
    await publishingService.getGithubToken(backend.getGHAppID(), backend.getGHKey(), backend.getGHInstallationID(), backend.getGitURL());
    expect(spyJwt).toHaveBeenCalledWith(
      {
        iat: expect.any(Number),
        exp: expect.any(Number),
        iss: backend.getGHAppID(),
      },
      backend.getGHKey(),
      { algorithm: "RS256" }
    );

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("Calls ghAPI with correct parameters", async () => {
    await publishingService.getGithubToken(backend.getGHAppID(), backend.getGHKey(), backend.getGHInstallationID(), backend.getGitURL());

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${backend.getGitURL()}app/installations/${backend.getGHInstallationID()}/access_tokens`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${fakeJwtToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  });
});
