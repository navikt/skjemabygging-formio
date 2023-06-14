import alert from "./alert";
import button from "./button";
import choices from "./choices";
import datepicker from "./datepicker";
import day from "./day";
import error from "./error";
import fieldset from "./fieldset";
import group from "./group";
import htmlElement from "./htmlElement";
import img from "./img";
import input from "./input";
import inputGroup from "./inputGroup";
import label from "./label";
import labelTrackChanges from "./labelTrackChanges";
import list from "./list";
import listGroup from "./listGroup";
import readMore from "./readMore";
import row from "./row";
import select from "./select";
import table from "./table";
import tabs from "./tabs";
import typography from "./typography";

const form = {
  ".formio-form": {
    ...alert,
    ...button,
    ...choices,
    ...datepicker,
    ...day,
    ...error,
    ...fieldset,
    ...input,
    ...inputGroup,
    ...img,
    ...group,
    ...htmlElement,
    ...label,
    ...labelTrackChanges,
    ...list,
    ...listGroup,
    ...readMore,
    ...row,
    ...select,
    ...table,
    ...tabs,
    ...typography,
    "& [hidden]": {
      display: "none !important",
    },
  },
};

export default form;
