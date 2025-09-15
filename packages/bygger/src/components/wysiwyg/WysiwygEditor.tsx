import { Heading } from '@navikt/ds-react';
import { FieldsetErrorMessage, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import {
  defineSchema,
  EditorProvider,
  PortableTextBlock,
  PortableTextChild,
  PortableTextEditable,
  RenderChildFunction,
  RenderDecoratorFunction,
  RenderStyleFunction,
} from '@portabletext/editor';
import { EventListenerPlugin } from '@portabletext/editor/plugins';
import { toHTML } from '@portabletext/to-html';
import { forwardRef, useState } from 'react';
import { ToolBar } from './ToolBar';
import './editor.css';

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
  defaultValue?: PortableTextBlock[] | string;
  onChange: (value: string | PortableTextBlock[]) => void;
  error?: string | boolean;
  autoFocus?: boolean;
  className?: string;
}

const WysiwygEditor = forwardRef<HTMLDivElement, Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, defaultValue, onChange, error, autoFocus }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const styles = useStyles();
    const [value, setValue] = useState<Array<PortableTextBlock> | undefined | string>(defaultValue);

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

    function isLink(
      props: PortableTextChild,
    ): props is PortableTextChild & { url: string; title: string; openInNewTab: boolean } {
      return 'url' in props;
    }

    const renderChild: RenderChildFunction = (props) => {
      console.log(JSON.stringify(props.value));
      if (props.schemaType.name === 'link' && isLink(props.value)) {
        return (
          <a href={props.value.url} target={props.value.openInNewTab ? '_blank' : '_self'} rel="noreferrer">
            {`${props.value.title}${props.value.openInNewTab ? ' (åpnes i ny fane)' : ''}`}
          </a>
        );
      }
      return <>{props.children}</>;
    };

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
              onChange(toHTML(event.value ?? []));
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
            renderListItem={(props) => <>{props.children}</>}
            style={{ border: '1px solid black', minHeight: '150px', padding: '0.5rem' }}
            className={className}
          />
          <p>{JSON.stringify(value)}</p>
        </div>
        {error && typeof error === 'string' && <FieldsetErrorMessage errorMessage={error} ref={ref} />}
      </EditorProvider>
    );
  },
);

export default WysiwygEditor;
