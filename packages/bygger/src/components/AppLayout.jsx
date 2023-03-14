import React from "react";
import PusherNotificationsProvider from "../context/notifications/NotificationsContext";
import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./Navbar/NavBar";

export const AppLayout = ({ children, navBarProps }) => {
  return (
    <>
      <NoScrollWrapper>
        <PusherNotificationsProvider>
          <NavBar {...navBarProps} />
        </PusherNotificationsProvider>
      </NoScrollWrapper>
      <Pagewrapper>{children}</Pagewrapper>
    </>
  );
};
