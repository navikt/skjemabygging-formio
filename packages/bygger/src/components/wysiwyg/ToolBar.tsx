import { SchemaDefinition, useEditor, useEditorSelector } from '@portabletext/editor';

import { BulletListIcon, LinkIcon, NumberListIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack, Select } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
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

const useStyle = makeStyles({
  select: {
    '& .navds-select__input': {
      minHeight: '2rem',
      padding: '0 2rem 0 .5rem',
    },
  },
});

export function ToolBar({ schemaDefinition }: Props) {
  const toolbarSchema = schemaDefinition;
  const editor = useEditor();
  const styles = useStyle();

  function DecoratorButton(props: { decorator: string; title: string }) {
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
          editor.send({ type: 'focus' });
          editor.send({
            type: 'decorator.toggle',
            decorator: props.decorator,
          });
        }}
      >
        {props.title}
      </Button>
    );
  }

  function StyleDropdown(props: { styles: { name: string; title?: string }[] }) {
    const activeStyle = useEditorSelector(editor, (state: any) => state?.style);

    return (
      <Select
        label="Skrifttype"
        hideLabel
        className={styles.select}
        value={activeStyle}
        onChange={(e) => {
          editor.send({ type: 'style.toggle', style: e.target.value });
          editor.send({ type: 'focus' });
        }}
      >
        {props.styles.map((style) => (
          <option key={style.name} value={style.name}>
            {style.title ?? style.name}
          </option>
        ))}
      </Select>
    );
  }

  function LinkButton(props: { annotations: string }) {
    const ref = useRef<HTMLDialogElement>(null);
    const [linkData, setLinkData] = useState<LinkData>({ title: '', url: '', openInNewTab: true });

    function onSubmit() {
      if (!linkData) {
        return;
      }
      editor.send({ type: 'focus' });
      editor.send({
        type: 'insert.inline object',
        inlineObject: {
          name: props.annotations,
          value: linkData,
        },
      });
    }

    return (
      <Box>
        <Button
          style={{
            height: '2rem',
          }}
          icon={<LinkIcon title="Link" fontSize="1.2rem" />}
          variant="secondary-neutral"
          onClick={() => ref.current?.showModal()}
        ></Button>
        <LinkModal dialogRef={ref} onSubmit={onSubmit} setLinkData={setLinkData} linkData={linkData} />
      </Box>
    );
  }

  function ListButton(props: { list: string }) {
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

  function StylesDropdown() {
    return <StyleDropdown styles={[...(toolbarSchema.styles ?? [])]} />;
  }

  function ListButtons() {
    return toolbarSchema.lists?.map((list) => <ListButton key={list.name} list={list.name} />);
  }

  function AnnotationButtons() {
    return toolbarSchema.annotations?.map((obj) => <LinkButton key={obj.name} annotations={obj.name} />);
  }

  return (
    <HStack gap="space-4" style={{ marginBottom: '.5rem' }} align="center">
      <StylesDropdown />
      <DecoratorButtons />
      <AnnotationButtons />
      <ListButtons />
    </HStack>
  );
}
