import React, {useEffect} from 'react';
import * as formiojs from 'formiojs';
import cloneDeep from "lodash.clonedeep";
import {styled} from "@material-ui/styles";

const BuilderMountElement = styled("div")({
  '& .builder-sidebar_scroll': {
    top: 230
  },
  '& .formarea': {
  paddingBottom: "50vh"
},
});

export const NavFormBuilder = ({form, onChange, formBuilderOptions}) => {
  let builder;
  let thisElement;
  let builderReady;
  let builderState = 'preparing';

  useEffect(() => {
    builder = new formiojs.FormBuilder(thisElement, {}, formBuilderOptions);
    builderReady = builder.ready;
    builderReady.then(() => {
      builderState = 'ready';
      builder.setForm(cloneDeep(form)).then(() => handleChange());
      handleChange();
      builder.instance.on('addComponent', handleChange);
      builder.instance.on('saveComponent', handleChange);
      builder.instance.on('updateComponent', handleChange);
      builder.instance.on('removeComponent', handleChange);
      builder.instance.on('deleteComponent', handleChange);
      builder.instance.on('pdfUploaded', handleChange);
    });

    return () => {
      builder.instance.destroy(true);
      builderState = 'destroyed';
      builder.instance = null;
      builder = null;
      console.log("builder destroyed")
    }
  }, []);

  useEffect(() => {
    if (builder) {
      builder.setForm(cloneDeep(form)).then(() => onChange(builder.instance.form));
    }
  }, [form, builder, onChange]);


  return <BuilderMountElement data-testid="builderMountElement" ref={element => thisElement = element}></BuilderMountElement>;

  function handleChange() {
    onChange(builder.instance.form);
  }
};
