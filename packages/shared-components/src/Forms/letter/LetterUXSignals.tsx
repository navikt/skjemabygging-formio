import { makeStyles } from "@material-ui/styles";
import React, { useEffect } from "react";

const useStyles = makeStyles({
  uxsignals: {
    maxWidth: "640px",
    margin: "-20px",
  },
});

interface Props {
  code: string;
}

const LetterUXSignals = ({ code }: Props) => {
  const classes = useStyles();
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://uxsignals-frontend.uxsignals.app.iterate.no/embed.js";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section>
      <div data-uxsignals-embed={code} className={classes.uxsignals} />
    </section>
  );
};

export default LetterUXSignals;
