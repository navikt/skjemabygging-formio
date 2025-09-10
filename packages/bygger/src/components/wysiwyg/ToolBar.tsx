import { SchemaDefinition, useEditor, useEditorSelector } from '@portabletext/editor';

// @ts-ignore
import { BulletListIcon, LinkIcon, NumberListIcon } from '@navikt/aksel-icons';
import * as selectors from '@portabletext/editor/selectors';
import { useState } from 'react';

type Props = {
  schemaDefinition: SchemaDefinition;
};

export function ToolBar({ schemaDefinition }: Props) {
  const editor = useEditor();
  const toolbarSchema = schemaDefinition;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [linkHref, setLinkHref] = useState('');

  function DecoratorButton(props: { decorator: string; title: string }) {
    const editor = useEditor();
    const active = useEditorSelector(editor, selectors.isActiveDecorator(props.decorator));

    return (
      <button
        style={{
          textDecoration: active ? 'underline' : 'unset',
        }}
        onClick={() => {
          editor.send({
            type: 'decorator.toggle',
            decorator: props.decorator,
          });
          editor.send({ type: 'focus' });
        }}
      >
        {props.title}
      </button>
    );
  }

  function StyleDropDown(props: { styles: { name: string; title?: string }[] }) {
    // @ts-ignore
    const activeStyle = useEditorSelector(editor, (state) => state.selection?.style);

    return (
      <label style={{ marginRight: '8px' }}>
        <select
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
        </select>
      </label>
    );
  }

  function AnnotationButton(props: { annotation: { name: string } }) {
    const active = useEditorSelector(editor, selectors.isActiveAnnotation(props.annotation.name));
    return (
      // <span>
      //   {props.annotation.name === 'link' && (
      //     <input
      //       type="text"
      //       placeholder="Enter link"
      //       value={linkHref}
      //       onChange={(e) => setLinkHref(e.target.value)}
      //       style={{ marginRight: '4px' }}
      //     />
      //   )}
      <button
        style={{
          textDecoration: active ? 'underline' : 'unset',
        }}
        onClick={() => {
          if (active) {
            editor.send({
              type: 'annotation.remove',
              annotation: {
                name: props.annotation.name,
              },
            });
          } else {
            editor.send({
              type: 'annotation.add',
              annotation: {
                name: props.annotation.name,
                value: props.annotation.name === 'link' ? { href: linkHref } : {},
              },
            });
          }
          editor.send({ type: 'focus' });
        }}
      >
        {props.annotation.name === 'link' ? <LinkIcon title="Link" fontSize="1.2rem" /> : props.annotation.name}
      </button>
      // </span>
    );
  }

  function ListButton(props: { list: string }) {
    const active = useEditorSelector(editor, selectors.isActiveListItem(props.list));

    const icons: Record<string, React.ReactNode> = {
      bullet: <BulletListIcon title="a11y-title" fontSize="1.5rem" />,
      number: <NumberListIcon title="a11y-title" fontSize="1.5rem" />,
    };

    return (
      <button
        style={{
          textDecoration: active ? 'underline' : 'unset',
        }}
        onClick={() => {
          editor.send({
            type: 'list item.toggle',
            listItem: props.list,
          });
          editor.send({ type: 'focus' });
        }}
      >
        {icons[props.list] ?? props.list}
      </button>
    );
  }

  return (
    <div style={{ marginBottom: '.5rem' }}>
      <StyleDropDown styles={[...(toolbarSchema.styles ?? [])]} />
      {toolbarSchema.decorators?.map((decorator) => (
        <DecoratorButton key={decorator.name} decorator={decorator.name} title={decorator.title ?? decorator.name} />
      ))}
      {toolbarSchema.annotations?.map((annotation) => (
        <AnnotationButton key={annotation.name} annotation={annotation} />
      ))}
      {toolbarSchema.lists?.map((list) => (
        <ListButton key={list.name} list={list.name} />
      ))}
    </div>
  );
}
