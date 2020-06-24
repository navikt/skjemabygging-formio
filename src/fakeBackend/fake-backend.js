import connect from 'connect';
import quip from './ourQuip.js';
import bodyParser from 'body-parser';
import {dispatcherWithBackend} from "./fakeWebApp.js";
import {FakeBackend} from "./FakeBackend.js";

const rewriteUrl = (req, res, next) => {
  req.url = req.url.replace('/backend/api', '');
  next();
};

const fallback = (req, res) => {
  console.log('slem request', `${req.method} ${req.url}`);
  res.notFound('Not found');
};

const backend = new FakeBackend();
const dispatcher = dispatcherWithBackend(backend);

const server = connect();
server.use(bodyParser.text({limit: '5mb', type: '*/*'}));
server.use(quip);
// server.use(rewriteUrl);
server.use(dispatcher);
server.use(fallback);
console.log('about to listen to 4000');
server.listen(4000);
