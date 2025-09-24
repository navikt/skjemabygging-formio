import { Heading } from '@navikt/ds-react';
import { FieldsetErrorMessage, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { htmlToBlocks } from '@portabletext/block-tools';
import {
  defineSchema,
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
import { Schema } from '@sanity/schema';
import clsx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import './editor.css';
import { LinkModal } from './LinkModal';
import { LinkData, ToolBar } from './ToolBar';

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
  onChange: (value: string | PortableTextBlock[]) => void;
  error?: string | boolean;
  autoFocus?: boolean;
  className?: string;
}

const WysiwygEditor = forwardRef<HTMLDivElement, Props>(({ className, defaultValue, onChange, error }, ref) => {
  const defaultSchema = Schema.compile({
    name: 'wysiwyg',
    types: [
      {
        type: 'object',
        name: 'editor',
        fields: [
          {
            title: 'Body',
            name: 'body',
            type: 'array',
            of: [{ type: 'block' }],
          },
          {
            title: 'link',
            name: 'a',
            type: 'annotation',
            of: [{ type: 'link' }],
          },
        ],
      },
    ],
  });

  const blockContentType = defaultSchema.get('editor').fields.find((field) => field.name === 'body').type;

  const [value, setValue] = useState<PortableTextBlock[] | undefined>(
    htmlToBlocks(defaultValue ?? '', blockContentType),
  );
  const styles = useStyles();
  console.log(value);

  const schemaDefinition = defineSchema({
    decorators: [{ name: 'strong', title: 'B' }],
    annotations: [{ name: 'link', title: 'Lenke', fields: [{ name: 'href', type: 'string' }] }],
    styles: [
      { name: 'p', title: 'Avsnitt' },
      { name: 'h3', title: 'Overskrift' },
      { name: 'h4', title: 'Underoverskrift ' },
    ],
    lists: [
      { name: 'bullet', title: 'Bulleted List' },
      { name: 'number', title: 'Numbered List' },
    ],
    inlineObjects: [
      {
        name: 'link',
        fields: [
          { name: 'title', type: 'string' },
          { name: 'url', type: 'string' },
          { name: 'openInNewTab', type: 'boolean' },
        ],
      },
    ],
  });

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
      const onSubmit = (data: LinkData) => {
        setLinkData(data);
      };
      const text = props.children.props.text.text;

      return (
        <div>
          <a
            href={props.value.href as string}
            target={text && text.includes('åpnes i ny fane') ? '_blank' : '_self'}
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              dialogRef.current?.showModal();
            }}
          >
            {text}
          </a>
          <LinkModal dialogRef={dialogRef} onSubmit={onSubmit} setLinkData={setLinkData} linkData={linkData!} />
        </div>
      );
    }

    return <>{props.children}</>;
  };

  function isLink(
    props: PortableTextChild,
  ): props is PortableTextChild & { url: string; title: string; openInNewTab: boolean } {
    return 'openInNewTab' in props;
  }
  const [linkData, setLinkData] = useState<LinkData | undefined>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const renderChild: RenderChildFunction = (props) => {
    const onSubmit = (data: LinkData) => {
      setLinkData(data);
    };
    console.log(JSON.stringify(props.value));
    if (props.schemaType.name === 'link' && isLink(props.value)) {
      return (
        <div>
          <a
            href={props.value.url}
            target={props.value.openInNewTab ? '_blank' : '_self'}
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              // setLinkData({
              //   url: (props.value as any).url,
              //   title: (props.value as any).title,
              //   openInNewTab: (props.value as any).openInNewTab,
              // });
              dialogRef.current?.showModal();
            }}
          >
            {`${props.value.title}${props.value.openInNewTab ? ' (åpnes i ny fane)' : ''}`}
          </a>
          <LinkModal dialogRef={dialogRef} onSubmit={onSubmit} setLinkData={setLinkData} linkData={linkData!} />
        </div>
      );
    }
    return <>{props.children}</>;
  };

  const components = {
    types: {
      link: ({ value }) => {
        const href = value?.url || '#';
        const text = `${value.title}${value.openInNewTab ? ' (åpnes i ny fane)' : ''}`;
        return `<a href="${href}" target="${value.openInNewTab ? '_blank' : '_self'}" rel="noopener noreferrer">${text}</a>`;
      },
    },
  };

  const html = toHTML(value ?? [], { components });

  return (
    <EditorProvider
      initialConfig={{
        schemaDefinition,
        initialValue: value,
      }}
    >
      <EventListenerPlugin
        on={(event) => {
          if (event.type === 'mutation') {
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
        <div>{html}</div>
      </div>
      {error && typeof error === 'string' && <FieldsetErrorMessage errorMessage={error} />}
    </EditorProvider>
  );
});

export default WysiwygEditor;
