import React, {useEffect, useState, useMemo} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";

function AppWrapper({error, flashMessage, children}) {
  const maybeErrorView = error ? <div>{error.reason.message}</div> : null;
  const maybeFlashMessageView = flashMessage ? <div>{flashMessage}</div> : null;
  return <>
    {maybeErrorView}
    {maybeFlashMessageView}
    {children}
    </>
}

/*
class AppClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      flashMessage: null
    }
    this.formio = new Formiojs(props.projectURL);
  }

  setError = (error) => {
    this.setState({error: error});
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.setError);
  }

  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.setError);
  }

  render() {
    const content = userData ? (
      <AuthenticatedApp formio={this.formio} store={this.props.store} />
    ) : (
      <UnauthenticatedApp projectURL={this.props.projectURL} />
    );
    return <AppWrapper error={this.state.error}>{content}</AppWrapper>;
  }
}

 */

function App({ projectURL, store }) {
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(null);
  useEffect(() => {
    window.addEventListener('unhandledrejection', setError);
    return () => window.removeEventListener("unhandledrejection", setError);
  }, []);
  const { userData } = useAuth();
  const flashTheMessage = (message) => {
    setFlashMessage(message);
    setTimeout(() => setFlashMessage(null), 5000);
  };
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <AuthenticatedApp formio={formio} store={store} flashTheMessage={flashTheMessage} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <AppWrapper error={error} flashMessage={flashMessage}>{content}</AppWrapper>;
}
export default App;
