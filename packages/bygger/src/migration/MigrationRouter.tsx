import { Route, Routes, useMatch } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import MigrationFormPreview from "./MigrationFormPreview";
import MigrationPage from "./MigrationPage";

const MigrationRouter = () => {
  const match = useMatch("/migrering");
  const path = match ? match.pathname : "";

  return (
    <AppLayout
      navBarProps={{
        title: "Migrer skjema",
        visSkjemaliste: true,
        visSkjemaMeny: false,
      }}
    >
      <Routes>
        <Route path={`${path}/forhandsvis/:formPath`} element={<MigrationFormPreview />} />
        <Route path={path} element={<MigrationPage />} />
      </Routes>
    </AppLayout>
  );
};

export default MigrationRouter;
