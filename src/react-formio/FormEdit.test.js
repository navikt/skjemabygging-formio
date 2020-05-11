import form from './form.json';
import FormEdit from "./FormEdit";
import FormioFormBuilder from 'formiojs/FormBuilder';

import React from "react";
import ReactTestRenderer from 'react-test-renderer';

describe('FormEdit', () => {
    let renderer;
    afterEach(() => {
        renderer.unmount();
    });

    xit('displays form', () => {
        renderer = ReactTestRenderer.create(
            <FormEdit form={form} saveForm={jest.fn()} />,
            {
                createNodeMock: (element) => {
                    if (element.props['data-testid'] === 'builderMountParent') {
                        const mountNode = document.createElement('div');
                        const result = document.createElement('div');
                        result.appendChild(mountNode);
                        return result;
                    }
                }
            });
        // console.log(formEdit.toJSON());
        const formEdit = renderer.root;
        expect(formEdit.instance.state.form).toEqual(formEdit.props.form);
        // add component to form and check that state contains newly added component

    });
});

describe('formiojs FormBuilder', () => {
    it('displays forms', async () => {
        const mountNode = document.createElement('div');
        const options = {};
        const builder = new FormioFormBuilder(mountNode, form, options);
        await builder.ready;
        builder.instance.on('saveComponent', jest.fn());
        builder.instance.on('updateComponent', jest.fn());
        builder.instance.on('removeComponent', jest.fn());
        builder.instance.on('cancelComponent', jest.fn());
        builder.instance.on('editComponent', jest.fn());
        builder.instance.on('addComponent', jest.fn());
        builder.instance.on('saveComponent', jest.fn());
        builder.instance.on('updateComponent', jest.fn());
        builder.instance.on('removeComponent', jest.fn());
        builder.instance.on('deleteComponent', jest.fn());
        builder.instance.on('pdfUploaded', jest.fn());
        builder.instance.destroy(true);
    });
});
