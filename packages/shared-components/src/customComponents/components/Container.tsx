import Container from "formiojs/components/container/Container";
import ContainerEditForm from "formiojs/components/container/Container.form";
import ContainerDisplayEditForm from "formiojs/components/container/editForm/Container.edit.display";

Container.editForm = () => {
  return ContainerEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...ContainerDisplayEditForm,
        {
          key: "hidden",
          ignore: true,
        },
        {
          key: "disabled",
          ignore: true,
        },
        {
          key: "tableView",
          ignore: true,
        },
        {
          key: "modalEdit",
          ignore: true,
        },
        { key: "tooltip", ignore: true },
        { key: "customClass", ignore: true },
      ],
    },
    { key: "data", ignore: true },
    { key: "logic", ignore: true },
    { key: "layout", ignore: true },
    { key: "validation", ignore: true },
  ]);
};

export default Container;
