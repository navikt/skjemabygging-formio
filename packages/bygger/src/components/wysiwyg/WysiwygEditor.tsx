import { Heading } from '@navikt/ds-react';
import { FieldsetErrorMessage, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { htmlToBlocks } from '@portabletext/block-tools';
import {
  EditorProvider,
  PortableTextBlock,
  PortableTextChild,
  PortableTextEditable,
  RenderAnnotationFunction,
  RenderChildFunction,
  RenderDecoratorFunction,
  RenderStyleFunction,
} from '@portabletext/editor';
import { EventListenerPlugin } from '@portabletext/editor/plugins';
import { toHTML } from '@portabletext/to-html';
import clsx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import './editor.css';
import { editorSchema, schemaDefinition } from './schemas';
import { ToolBar } from './ToolBar';

const useStyles = makeStyles({
  editor: {
    resize: 'vertical',
    backgroundColor: 'var(--a-bg-default)',
    minHeight: 'min-content',
    borderRadius: 'var(--a-border-radius-medium)',
  },
  error: {
    '&:not(:hover, :disabled)': {
      border: '2px solid',
      borderColor: 'var(--ac-textfield-error-border, var(--ac-textfield-error-border, var(--a-border-danger)))',
      boxShadow:
        '0 0 0 1px var(--ac-textfield-error-border, var(--__ac-textfield-error-border, var(--a-border-danger)))',
    },
  },
});

interface Props {
  defaultValue?: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  autoFocus?: boolean;
  className?: string;
}

const WysiwygEditor = forwardRef<HTMLDivElement, Props>(({ className, defaultValue, onChange, error }, ref) => {
  const styles = useStyles();
  const blockContentType = editorSchema.get('editor').fields.find((field) => field.name === 'body').type;

  const [value, setValue] = useState<PortableTextBlock[] | undefined>(
    htmlToBlocks(defaultValue ?? '', blockContentType),
  );

  // console.log('html', defaultValue);
  // console.log('block', value);

  const renderDecorator: RenderDecoratorFunction = (props) => {
    if (props.value === 'strong') {
      return <strong>{props.children}</strong>;
    }
    if (props.value === 'underline') {
      return <u>{props.children}</u>;
    }
    return <>{props.children}</>;
  };

  const renderStyle: RenderStyleFunction = (props) => {
    if (props.schemaType.value === 'h3') {
      return (
        <Heading level="3" size="large">
          {props.children}
        </Heading>
      );
    }
    if (props.schemaType.value === 'h4') {
      return (
        <Heading level="4" size="medium">
          {props.children}
        </Heading>
      );
    }
    return <>{props.children}</>;
  };

  const renderAnnotation: RenderAnnotationFunction = (props) => {
    if (props.schemaType.name === 'link') {
      // const onSubmit = (data: LinkData) => {
      //   setLinkData(data);
      // };
      const text = props.children.props.text.text;

      return (
        <a
          href={props.value.href as string}
          target={text && text.includes('åpnes i ny fane') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            dialogRef.current?.showModal();
          }}
        >
          {text}
        </a>
      );
    }

    return <>{props.children}</>;
  };

  function isLink(
    props: PortableTextChild,
  ): props is PortableTextChild & { url: string; title: string; openInNewTab: boolean } {
    return 'openInNewTab' in props;
  }
  // const [_, setLinkData] = useState<LinkData>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const renderChild: RenderChildFunction = (props) => {
    // const onSubmit = (data: LinkData) => {
    //   setLinkData(data);
    // };
    if (props.schemaType.name === 'link' && isLink(props.value)) {
      return (
        <a
          href={props.value.url}
          target={props.value.openInNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            dialogRef.current?.showModal();
          }}
        >
          {`${props.value.title}${props.value.openInNewTab ? ' (åpnes i ny fane)' : ''}`}
        </a>
      );
    }
    return <>{props.children}</>;
  };

  const components = {
    types: {
      link: ({ value }) => {
        const href = value?.url;
        const text = `${value.title}${value.openInNewTab ? ' (åpnes i ny fane)' : ''}`;
        return `<a href="${href}" target="${value.openInNewTab ? '_blank' : '_self'}" rel="noopener noreferrer">${text}</a>`;
      },
    },
  };

  // const html = toHTML(value ?? [], { components });

  return (
    <EditorProvider
      initialConfig={{
        schemaDefinition,
        initialValue: value,
      }}
    >
      <EventListenerPlugin
        on={(event) => {
          console.log('event før', event);

          if (event.type === 'mutation') {
            console.log('value', value);
            console.log('event value', event.value);
            setValue(event.value);
            onChange(toHTML(event.value ?? [], { components }));
          }
        }}
      />
      <div style={{ marginRight: '2rem' }}>
        <ToolBar schemaDefinition={schemaDefinition} />
        <PortableTextEditable
          ref={ref}
          renderBlock={(props) => <div>{props.children}</div>}
          renderDecorator={renderDecorator}
          renderStyle={renderStyle}
          renderChild={renderChild}
          renderAnnotation={renderAnnotation}
          renderListItem={(props) => <>{props.children}</>}
          style={{ border: '1px solid black', minHeight: '150px', padding: '0.5rem' }}
          className={clsx(className, { [styles.error]: !!error })}
        />
        <div>{JSON.stringify(value)}</div>
        {/*<div>{html}</div>*/}
      </div>
      {error && typeof error === 'string' && <FieldsetErrorMessage errorMessage={error} />}
    </EditorProvider>
  );
});

export default WysiwygEditor;
