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
      ],
    },
  ]);
};

export default Container;
