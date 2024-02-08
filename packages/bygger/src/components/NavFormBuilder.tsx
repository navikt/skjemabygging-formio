import { NavFormioJs, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { useEffect, useRef } from 'react';
import '../formio-overrides/webform-builder-overrides';
import { builderStyles } from './styles';

const useBuilderMountElementStyles = makeStyles(builderStyles);

interface BuilderMountElementProps {
  className: string;
  children?: React.ReactNode;
  setRef: React.MutableRefObject<null>;
}

interface NavFormBuilderProps {
  className: string;
  form: NavFormType;
  onChange: (form: NavFormType) => void;
  onReady?: () => void;
  formBuilderOptions: any;
}

const BuilderMountElement = ({ children, className, setRef, ...rest }: BuilderMountElementProps) => {
  useBuilderMountElementStyles();
  return (
    <div className={className} ref={setRef} {...rest}>
      {children}
    </div>
  );
};

const NavFormBuilder = ({ form, onChange, onReady, formBuilderOptions, className }: NavFormBuilderProps) => {
  const elementRef = useRef(null);
  const builder: any = useRef(null);

  const handleChange = () => {
    onChange(cloneDeep(builder?.current?.instance?.form));
  };

  const createBuilder = (page?: number) => {
    //@ts-ignore
    builder.current = new NavFormioJs.Formio.FormBuilder(elementRef.current, cloneDeep(form), formBuilderOptions);
    if (page) {
      builder?.current?.instance?.setPage?.(page);
    }
    builder?.current?.ready.then(() => {
      builder?.current?.instance?.on('change', handleChange);
      if (onReady) {
        onReady();
      }
    });
  };

  const destroyBuilder = () => {
    if (builder && builder.current) {
      builder.current.instance?.off('change', handleChange);
      builder.current.instance?.destroy(true);
      builder.current.destroy();
      builder.current = null;
    }
  };

  const updateFormBuilder = () => {
    const page = builder?.current?.instance?.page;
    destroyBuilder();
    createBuilder(page);
  };

  useEffect(() => {
    createBuilder();
    return () => {
      destroyBuilder();
    };
  }, []);

  useEffect(() => {
    const builderInstance = builder?.instance;
    const prevPublishedForm = formBuilderOptions.formConfig.publishedForm;
    const nextPublishedForm = formBuilderOptions.formConfig.publishedForm;
    if (!isEqual(nextPublishedForm, prevPublishedForm) && builderInstance) {
      builderInstance.options.formConfig.publishedForm = nextPublishedForm;
      builderInstance.redraw();
    }
    if (isEqual(builderInstance?.form, form)) {
      return;
    }
    updateFormBuilder();
  }, []);

  return (
    <BuilderMountElement
      className={`${className} bootstrap-style`}
      data-testid="builderMountElement"
      setRef={elementRef}
    ></BuilderMountElement>
  );
};

export { NavFormBuilder as UnstyledNavFormBuilder };
export default NavFormBuilder;
