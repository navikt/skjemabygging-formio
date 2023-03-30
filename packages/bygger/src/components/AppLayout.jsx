import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./Navbar/NavBar";

export const AppLayout = ({ children, navBarProps }) => {
  return (
    <>
      <NoScrollWrapper>
        <NavBar {...navBarProps} />
      </NoScrollWrapper>
      <Pagewrapper>{children}</Pagewrapper>
    </>
  );
};
