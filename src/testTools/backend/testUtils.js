import { Backend } from "../../backend/index.js";

const { Response } = jest.requireActual("node-fetch");

export function ghForTest() {
  return {
    appID: "123456",
    installationID: "123456",
    key:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "MIICXQIBAAKBgQDYbDcf4T5fTgq7WmYSYh9DRi2ivCKoRx52GygbO/PLJNBJn9Oi\n" +
      "XUD5lS9RT9eT5yAC29ZquXO8kDLhpnw/G7Z4kjNVq6MGjcbNmZH6K/3KOnlES/cn\n" +
      "wwEwKL8jROnn6Sh8+pgYxHhc7WhLzuOme6Ux26R7DcxPCWA1t8o2ee1EmwIDAQAB\n" +
      "AoGAeoCGk10D2R5rpLD+pdk0qPfITR0A4Q+ghmnIweGllY849vOo73apmJyBNB1l\n" +
      "gSqKTBPzwmVGxa05n9CE85PULFBHMymkEEfFbLafNOovxbcv+MjzWl30mTi3orX7\n" +
      "Q9O/tLvBMgz50ey870E+al7IUUttyMkpYvo//kSeSVY1ckECQQD7fSOrYEwwkRyq\n" +
      "/PkNmyWapIo+5QheudmfapKN2SmXbj0utc7tG7JP/cJq9M652gK1kAO0fmBOfWmO\n" +
      "dMW/qMJXAkEA3E4MkGoT/t/6KkpIjGH7MqUxWXNEGJhxxcb88H7tJHzaveAYYy1q\n" +
      "eRjbOKp4YHF4cHOdq6jxMHVtOhXo8JnNXQJBAKADkIWDYRbpzebRzRmmJLgPh1Lb\n" +
      "YYb8E4bGRXdxvG/4mX81+PKO09bnrCNnnn1MRLsHZgQbAOYQD/CvRf9bvkMCQQC3\n" +
      "QCzvS22KiuBaoSOrsizzObnNADZahyPMMfNgURQNT9XcLzXZ+YMha+2eOx6aioh2\n" +
      "cZVrnsHRXzwWHvd+e1D5AkAXZwQAyRhOF5PydFGLVUd1Uy5pfqVxShmIzoN1nWsG\n" +
      "BDLEqN03nq4wcrbFZ1gvHhD/XF44XrUClblWogLO75fE\n" +
      "-----END RSA PRIVATE KEY-----",
  };
}

export const createBackendForTest = () => {
  const gh = ghForTest();
  const gitURL = "https://api.example.com/";
  const projectURL = "https://projectApi.example.com";
  return new Backend(projectURL, gitURL, gh);
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
