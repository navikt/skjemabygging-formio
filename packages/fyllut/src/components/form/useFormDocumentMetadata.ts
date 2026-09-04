import { useEffect } from 'react';

interface FormMetadata {
  title?: string;
}

const useFormDocumentMetadata = (form?: FormMetadata) => {
  useEffect(() => {
    const metaPropOgTitle = document.querySelector('meta[property="og:title"]');
    const metaNameDescr = document.querySelector('meta[name="description"]');
    const metaNameOgDescr = document.querySelector('meta[name="og:description"]');
    const setHeaderProp = (headerObj: Element | null, metaPropValue: string) => {
      headerObj?.setAttribute('content', metaPropValue);
    };

    if (form?.title) {
      document.title = `${form.title} | www.nav.no`;
      setHeaderProp(metaPropOgTitle, `${form.title} | www.nav.no`);
    }

    return () => {
      document.title = 'Fyll ut skjema - www.nav.no';
      setHeaderProp(metaPropOgTitle, 'Fyll ut skjema - www.nav.no');
      setHeaderProp(metaNameDescr, 'Nav søknadsskjema');
      setHeaderProp(metaNameOgDescr, 'Nav søknadsskjema');
    };
  }, [form]);
};

export default useFormDocumentMetadata;
