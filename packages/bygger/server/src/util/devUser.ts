import { Request } from "express";
import formioService from "../services/formioService";
import { User } from "../types";
import { getFormioToken } from "./requestTool";

const devUser = {
  name: "dev-user",
  preferredUsername: "dev-user-preferred",
  NAVident: "dev-navident",
};

export const getDevUser = async (req: Request): Promise<User> => {
  const formioToken = getFormioToken(req);
  if (formioToken) {
    try {
      const formioUser = await formioService.getFormioUser(formioToken);
      return {
        name: formioUser.data.email,
        preferredUsername: formioUser.data.email,
        NAVident: "N/A",
      };
    } catch (e) {
      // @ts-ignore
      console.error("Error while fetching dev user:", e.message);
    }
  }
  return devUser;
};
