import dotenv from "dotenv";
import nock from "nock";

dotenv.config({ path: "./src/test/test.env" });

nock.disableNetConnect();
nock.enableNetConnect("127.0.0.1");
