"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var edit_ejs_1 = require("./edit.ejs");
var view_ejs_1 = require("./view.ejs");
exports.default = {
    treeView: {
        form: view_ejs_1.default,
    },
    treeEdit: {
        form: edit_ejs_1.default
    }
};
