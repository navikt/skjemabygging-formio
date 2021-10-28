# Custom components and extending components

There are several ways we can modify the set of components available in the Form.io editor:

-   Change the template of an existing component in the `packages/shared-components/src/template/templates/navdesign` folder.
-   Modify an existing Form.io component, like adding or removing options for TextField or overriding some of its functions.
-   Extend an existing Form.io component, e.g. Fodselsnummer, which extends TextField.
-   Create a new component that uses React, e.g. by importing a NAV Design System React component, like RadioPanelGruppe.

Ideally, we would like to do a lot more of React-based custom components using the design system directly.
That would make it far easier to upgrade when the design system makes changes.
However, we have experienced a lot of bugs and difficulties with the Form.io integration for these components, so we have tabled creating new ones until we "_figure it out_"(TM).

## Changing a template

Changing templates are quite trivial. Look up the correct template in `packages/shared-components/src/template/templates/navdesign` and edit it.

Make sure to keep all `ref`-attributes, as Form.io uses them to hook up event listeners, but otherwise it should be safe to make changes.

`ctx.component` can be referenced to use properties from the component class.
Values from `scheme` will also be accessible from `ctx.component`.

## Modifying an existing Form.io component

Modifying a component is useful for:

-   adding options that can be used in templates
-   removing options that are not used
-   or changing behaviour of some functions, like validation or adding logging after some events.

To modify a component, create a JS class in `packages/shared-components/src/customComponents/components`, then import and export it in `packages/shared-components/src/customComponents/index.js`.

Most changes we make tend to be done for the components `editForm`, `builderInfo` and `schema` properties.

-   `builderInfo` affects how the component is added in the FormBuilder.
    -   `title` is the displayed name in the component list.
    -   `group` defines which group it is ordered under.
    -   `icon` defines [Font Awesome icons](https://fontawesome.com/v4.7/cheatsheet/)
-   `schema` provides default values and sets properties for the component, which are accessible in the templates through `ctx.component[property-name]`.
-   `editForm` specifies the options available when configuring the component.
    -   `editForm` is a function that takes an array as a parameter. The editForm should extend another component's editForm, like so:
        ```
        static editForm(...extend) {
            return OtherComponentsEditForm([
                {
                    key: "display",
                    components: [
                        {
                            type: "textfield",
                            label: "My option",
                            key: "myOption",
                            weight: 2, // Used to sort options. Lower number means it is placed earlier in the edit form.
                            input: true,
                        }
                    ]
                },
                ...extend
            ])
        }
        ```
    -   Remove options or panels by adding an object to the components list with the key of the option/panel and `ignore: true`:
        ```
        static editForm(...extend) {
            return OtherComponentsEditForm([
                {
                    key: "display",
                    components: [
                        {
                            key: "tooltip",
                            ignore: true, // Hides the tooltip option in the "Display" panel
                        }
                    ]
                },
                {
                    key: "data",
                    ignore: true, // Hides the "Data" panel
                }
            ])
        }
        ```

We have standardized on specifying `builderInfo` and `schema` details in `packages/shared-components/src/Forms/form-builder-options/index.js`, to make it easier to make "sweeping" changes for multiple components at once.

The property name/key used in `index.js` must match the name used in FormBuilderOptions, but otherwise naming is flexible. However, it is recommended to use the same class name.

## Extending an existing Form.io component

The goal of extending a component instead of just modifying it is to have the two versions live side-by-side.
Often, we want to use the extended version in our forms, but the original version is used in the Form.io builder, and our modified design does not fit there.
In order to achieve this, we need to both extend the component and create a more specific template.

### Extending a component

Extending a component is mainly about creating a new class that extends the old one, and giving it a new type.

<b>ExtendedComponent.js</b>

```
class ExtendedComponent extends OriginalComponent {
    builderInfo() { ... }

    editForm(...) { ... }

    schema(...extends) { ... }
}
```

The type is set in the `schema`-part in `form-builder-options/index.js`:

<b>FormBuilderOptions</b>

```
const builderPalette = {
 basic: {
   extendedComponent: {
     title: "",
     key: "",
     icon: "my-icon"
     schema: {
        label: "Extended component",
        type: "extendedComponent",
        ...
     }
   }
 }
}
```

> <b>NB!</b></br>
> In some cases, overriding the component type will create issues, because underlying Form.io logic will depend on the component type. DataGrid is one such case.
> If facing this problem, adding a custom property in the schema for the component, and splitting the rendering in the template based on this is a decent workaround.

### Specificity of templates

Naming of templates decides which one is used for each component. See [the docs](https://help.form.io/developers/form-templates) for specifics, but in short,
templates are by default added using just the template name, like `input` or `button`. However, we can add component type and/or component key to add even higher specificity:

```
templateName-component.type-component.key
templateName-component.type
templateName-component.key
templateName
```

These names are defined in `src/template/templates/navdesign/index.js`. For adding a specific template for the number input, export it as below:

```
import input from "./input";
import numberTemplate from "./input-number";
import ageTemplate from "./input-age";

export default {
    ...
    input,
    "input-number": numberTemplate,
    "input-number-age": ageTemplate,
}
```

When extending components, adding the component type, like `templateName-componentType` is sufficient. That will ensure the new component can have it's own template, without affecting the extended component.
In some cases, like where we create some specific standard-components, like `address` or `phoneNumber`, we could want to use the key as well, but think through whether the component should be general enough to have it's own component type.

### Create new React Component

So far, we have struggled making custom React-based components. We do it using FormioReactComponent, but it does not work correctly.
Values are not loaded correctly when navgating back to the wizard from the summary page, there are warnings about memory leaks, etc.

As such, we prefer not to create these types of components at this time, although that would be the end goal: We want to use NAV Design System components directly.

#### FormioReactComponent

To render React-based components, we have FormioReactComponent. This is a custom renderer that wraps React-components.
The React component will need a wrapper that extends FormioReactComponent, and then render the actual React component, e.g. a NAV Design System component.

Changes to FormioReactComponent should normally be limited to bugfixes making sure these custom components are rendered/updated as they should, but changes to all such components can also be added here. 