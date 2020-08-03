import * as fetchUtils from "./fetchUtils";
import {checkPublishingAccess} from "./publishingService";

describe('CheckPublishingAccess', () => {
  it('calls URL with correct parameters', async () => {
    const stub = sinon.stub(fetchUtils, 'fetchWithErrorHandling'); //add stub
    stub.returns({status: "OK", data: {}});

    let token = "testtoken";
    let projectUrl = "testUrl";

    await checkPublishingAccess(token, projectUrl);

    sinon.assert.calledWith(stub, `${projectUrl}/current`, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": token,
      },
    });

    fetchUtils.fetchWithErrorHandling.restore();  //remove stub
  });
});
