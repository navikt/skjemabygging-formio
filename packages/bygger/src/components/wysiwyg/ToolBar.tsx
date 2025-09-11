import { SchemaDefinition, useEditor, useEditorSelector } from '@portabletext/editor';

import { BulletListIcon, LinkIcon, NumberListIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack, Select } from '@navikt/ds-react';
import * as selectors from '@portabletext/editor/selectors';
import { useRef, useState } from 'react';
import { LinkModal } from './LinkModal';

type Props = {
  schemaDefinition: SchemaDefinition;
};

export type LinkData = {
  title: string;
  url: string;
  openInNewTab: boolean;
};

export function ToolBar({ schemaDefinition }: Props) {
  const toolbarSchema = schemaDefinition;

  function DecoratorButton(props: { decorator: string; title: string }) {
    const editor = useEditor();
    const active = useEditorSelector(editor, selectors.isActiveDecorator(props.decorator));

    return (
      <Button
        style={{
          backgroundColor: active ? 'var(--a-blue-600)' : 'unset',
          color: active ? 'white' : 'black',
          height: '2rem',
        }}
        variant="secondary-neutral"
        onClick={() => {
          editor.send({
            type: 'decorator.toggle',
            decorator: props.decorator,
          });
          editor.send({ type: 'focus' });
        }}
      >
        {props.title}
      </Button>
    );
  }

  function StyleDropdown(props: { styles: { name: string; title?: string }[] }) {
    const editor = useEditor();
    const activeStyle = useEditorSelector(editor, (state: any) => state?.style);

    return (
      <Select
        label="Skrifttype"
        hideLabel
        style={{
          marginRight: '8px',
          width: 'fit-content',
        }}
        value={activeStyle}
        onChange={(e) => {
          editor.send({ type: 'style.toggle', style: e.target.value });
          editor.send({ type: 'focus' });
        }}
      >
        <option value="">Skrifttype</option>
        {props.styles.map((style) => (
          <option key={style.name} value={style.name}>
            {style.title ?? style.name}
          </option>
        ))}
      </Select>
    );
  }

  function AnnotationButton(props: { annotation: { name: string } }) {
    const editor = useEditor();
    const active = useEditorSelector(editor, selectors.isActiveAnnotation(props.annotation.name));
    const ref = useRef<HTMLDialogElement>(null);
    const [linkData, setLinkData] = useState<LinkData>({ title: '', url: '', openInNewTab: true });

    function onSubmit() {
      console.log('submitting', linkData);
      if (!linkData) {
        return;
      }
      editor.send({ type: 'focus' });
      editor.send({
        type: 'insert.inline object',
        inlineObject: {
          name: 'link',
          value: linkData,
        },
      });
    }

    return (
      <Box>
        <Button
          style={{
            backgroundColor: active ? 'var(--a-blue-600)' : 'unset',
            color: active ? 'white' : 'black',
            height: '2rem',
          }}
          icon={props.annotation.name === 'link' && <LinkIcon title="Link" fontSize="1.2rem" />}
          variant="secondary-neutral"
          onClick={() => ref.current?.showModal()}
        ></Button>
        <LinkModal dialogRef={ref} onSubmit={onSubmit} setLinkData={setLinkData} linkData={linkData} />
      </Box>
    );
  }

  function ListButton(props: { list: string }) {
    const editor = useEditor();
    const active = useEditorSelector(editor, selectors.isActiveListItem(props.list));

    const icons: Record<string, React.ReactNode> = {
      bullet: <BulletListIcon title="a11y-title" fontSize="1.5rem" />,
      number: <NumberListIcon title="a11y-title" fontSize="1.5rem" />,
    };

    return (
      <Button
        style={{
          backgroundColor: active ? 'var(--a-blue-600)' : 'unset',
          color: active ? 'white' : 'black',
          height: '2rem',
        }}
        variant="secondary-neutral"
        onClick={() => {
          editor.send({
            type: 'list item.toggle',
            listItem: props.list,
          });
          editor.send({ type: 'focus' });
        }}
        icon={icons[props.list] ?? props.list}
      />
    );
  }

  function DecoratorButtons() {
    return toolbarSchema.decorators?.map((decorator) => (
      <DecoratorButton key={decorator.name} decorator={decorator.name} title={decorator.title ?? decorator.name} />
    ));
  }

  function LinkButton() {
    return toolbarSchema.annotations?.map((annotation) => (
      <AnnotationButton key={annotation.name} annotation={annotation} />
    ));
  }

  function StylesDropdown() {
    return <StyleDropdown styles={[...(toolbarSchema.styles ?? [])]} />;
  }

  function ListButtons() {
    return toolbarSchema.lists?.map((list) => <ListButton key={list.name} list={list.name} />);
  }

  return (
    <HStack gap="space-4" style={{ marginBottom: '.5rem' }} align="center">
      <StylesDropdown />
      <DecoratorButtons />
      <LinkButton />
      <ListButtons />
    </HStack>
  );
}
