"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("./address");
var builder_1 = require("./builder");
var builderComponent_1 = require("./builderComponent");
var builderComponents_1 = require("./builderComponents");
var builderEditForm_1 = require("./builderEditForm");
var builderPlaceholder_1 = require("./builderPlaceholder");
var builderSidebar_1 = require("./builderSidebar");
var builderSidebarGroup_1 = require("./builderSidebarGroup");
var builderWizard_1 = require("./builderWizard");
var button_1 = require("./button");
var checkbox_1 = require("./checkbox");
var columns_1 = require("./columns");
var component_1 = require("./component");
var componentModal_1 = require("./componentModal");
var components_1 = require("./components");
var container_1 = require("./container");
var datagrid_1 = require("./datagrid");
var day_1 = require("./day");
var dialog_1 = require("./dialog");
var editgrid_1 = require("./editgrid");
var field_1 = require("./field");
var fieldset_1 = require("./fieldset");
var file_1 = require("./file");
var html_1 = require("./html");
var icon_1 = require("./icon");
var iconClass_1 = require("./iconClass");
var input_1 = require("./input");
var label_1 = require("./label");
var loader_1 = require("./loader");
var loading_1 = require("./loading");
var map_1 = require("./map");
var message_1 = require("./message");
var multipleMasksInput_1 = require("./multipleMasksInput");
var multiValueRow_1 = require("./multiValueRow");
var multiValueTable_1 = require("./multiValueTable");
var panel_1 = require("./panel");
var pdf_1 = require("./pdf");
var pdfBuilder_1 = require("./pdfBuilder");
var pdfBuilderUpload_1 = require("./pdfBuilderUpload");
var radio_1 = require("./radio");
var resourceAdd_1 = require("./resourceAdd");
var select_1 = require("./select");
var selectOption_1 = require("./selectOption");
var signature_1 = require("./signature");
var survey_1 = require("./survey");
var tab_1 = require("./tab");
var table_1 = require("./table");
var tree_1 = require("./tree");
var partials_1 = require("./tree/partials");
var webform_1 = require("./webform");
var well_1 = require("./well");
var wizard_1 = require("./wizard");
var wizardHeader_1 = require("./wizardHeader");
var wizardNav_1 = require("./wizardNav");
var cssClasses_1 = require("./cssClasses");
exports.default = __assign(__assign({ transform: function (type, text) {
        if (!text) {
            return text;
        }
        switch (type) {
            case 'class':
                return this.cssClasses.hasOwnProperty(text.toString()) ? this.cssClasses[text.toString()] : text;
        }
        return text;
    }, defaultIconset: 'fa', iconClass: iconClass_1.default,
    cssClasses: cssClasses_1.default,
    address: address_1.default,
    builder: builder_1.default,
    builderComponent: builderComponent_1.default,
    builderComponents: builderComponents_1.default,
    builderEditForm: builderEditForm_1.default,
    builderPlaceholder: builderPlaceholder_1.default,
    builderSidebar: builderSidebar_1.default,
    builderSidebarGroup: builderSidebarGroup_1.default,
    builderWizard: builderWizard_1.default,
    button: button_1.default,
    checkbox: checkbox_1.default,
    columns: columns_1.default,
    component: component_1.default,
    componentModal: componentModal_1.default,
    components: components_1.default,
    container: container_1.default,
    datagrid: datagrid_1.default,
    day: day_1.default,
    dialog: dialog_1.default,
    editgrid: editgrid_1.default,
    field: field_1.default,
    fieldset: fieldset_1.default,
    file: file_1.default,
    html: html_1.default,
    icon: icon_1.default,
    input: input_1.default,
    label: label_1.default,
    loader: loader_1.default,
    loading: loading_1.default,
    map: map_1.default,
    message: message_1.default,
    multipleMasksInput: multipleMasksInput_1.default,
    multiValueRow: multiValueRow_1.default,
    multiValueTable: multiValueTable_1.default,
    panel: panel_1.default,
    pdf: pdf_1.default,
    pdfBuilder: pdfBuilder_1.default,
    pdfBuilderUpload: pdfBuilderUpload_1.default,
    radio: radio_1.default,
    resourceAdd: resourceAdd_1.default,
    select: select_1.default,
    selectOption: selectOption_1.default,
    signature: signature_1.default,
    survey: survey_1.default,
    tab: tab_1.default,
    table: table_1.default,
    tree: tree_1.default }, partials_1.default), { webform: webform_1.default,
    well: well_1.default,
    wizard: wizard_1.default,
    wizardHeader: wizardHeader_1.default,
    wizardNav: wizardNav_1.default });
