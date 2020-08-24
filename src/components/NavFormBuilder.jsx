import React, {useEffect, useRef} from 'react';
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
  const thisElement = useRef();
  let builderState = 'preparing';

  useEffect(() => {
    const builder = new formiojs.FormBuilder(thisElement.current, {}, formBuilderOptions);
    const builderReady = builder.ready;

    function handleChange() {
      onChange(builder.instance.form);
    }

    builderReady.then(() => {
      builderState = 'ready';
      builder.setForm(cloneDeep(form));
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
      console.log("builder destroyed")
    }
  }, [form]);

  return <BuilderMountElement data-testid="builderMountElement" ref={thisElement}></BuilderMountElement>;


};
