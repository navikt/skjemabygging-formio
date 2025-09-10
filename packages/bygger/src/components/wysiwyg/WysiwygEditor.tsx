import { Box, Heading } from '@navikt/ds-react';
import { FieldsetErrorMessage, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import {
  defineSchema,
  EditorProvider,
  PortableTextBlock,
  PortableTextEditable,
  RenderAnnotationFunction,
  RenderDecoratorFunction,
  RenderListItemFunction,
  RenderStyleFunction,
} from '@portabletext/editor';
import { EventListenerPlugin } from '@portabletext/editor/plugins';
import { forwardRef, useState } from 'react';
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
  defaultValue?: PortableTextBlock[];
  onChange: (value: string | PortableTextBlock[]) => void;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}

const WysiwygEditor = forwardRef<HTMLDivElement, Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, defaultValue, onChange, error, autoFocus }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const styles = useStyles();
    const [value, setValue] = useState<Array<PortableTextBlock> | undefined>(defaultValue || undefined);

    const schemaDefinition = defineSchema({
      decorators: [
        { name: 'strong', title: 'B' },
        { name: 'underline', title: 'Understrek' },
      ],
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
        return <span style={{ textDecoration: 'underline' }}>{props.children}</span>;
      }

      return <>{props.children}</>;
    };

    const renderListItem: RenderListItemFunction = (props) => {
      if (props.schemaType.value === 'bullet') {
        return <li style={{ listStyleType: 'disc', marginLeft: '1.5em' }}>{props.children}</li>;
      }
      if (props.schemaType.value === 'number') {
        return <li style={{ listStyleType: 'decimal', marginLeft: '1.5em' }}>{props.children}</li>;
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
              onChange(event.value || '');
            }
          }}
        />
        <Box padding="4">
          <ToolBar schemaDefinition={schemaDefinition} />
          <PortableTextEditable
            ref={ref}
            renderBlock={(props) => <div>{props.children}</div>}
            renderDecorator={renderDecorator}
            renderStyle={renderStyle}
            renderAnnotation={renderAnnotation}
            renderListItem={renderListItem}
            style={{ border: '1px solid black', padding: '0.5em' }}
            className={className}
          />
        </Box>

        {error && <FieldsetErrorMessage errorMessage={error} ref={ref} />}
        <div>{JSON.stringify(value)}</div>
      </EditorProvider>
    );
  },
);

export default WysiwygEditor;
