import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';

const editFormCustomError = (): Component => {
  return {
    type: 'panel',
    title: 'Egendefinerte feilmeldinger',
    collapsible: true,
    collapsed: true,
    key: 'errors',
    components: [
      {
        ...editFormAceEditor('json'),
        key: 'errors',
        hideLabel: true,
      },
      {
        type: 'htmlelement',
        key: 'errorDescription',
        tag: 'div',
        content: `
          <p>Du kan sette forskjellige feilmeldinger på forskjellige feil</p>

<pre>{
  "required": "{<span/>{ field }} er påkrevd.",
  "maxLength": "{<span/>{ field }} er for langt."
}</pre>

          <p>Du kan sette feilmeldingen for følgende nøkler:</p>
          <ul>
            <li>r<span/>equired</li>
            <li>m<span/>in</li>
            <li>m<span/>ax</li>
            <li>m<span/>inLength</li>
            <li>m<span/>axLength</li>
            <li>m<span/>inWords</li>
            <li>m<span/>axWords</li>
            <li>i<span/>nvalid_email</li>
            <li>i<span/>nvalid_date</li>
            <li>i<span/>nvalid_day</li>
            <li>i<span/>nvalid_regex</li>
            <li>m<span/>ask</li>
            <li>p<span/>attern</li>
            <li>c<span/>ustom</li>
          </ul>

          <p>Avhengig av feilmeldingen av feilmeldingen kan følgende variabler benyttes:</p>
          <ul>
           <li><code>{<span/>{ f<span/>ield }}</code> blir erstattet med ledeteksten til feltet.</li>
           <li><code>{<span/>{ m<span/>in }}</code></li>
           <li><code>{<span/>{ m<span/>ax }}</code></li>
           <li><code>{<span/>{ l<span/>ength }}</code></li>
           <li><code>{<span/>{ p<span/>attern }}</code></li>
           <li><code>{<span/>{ m<span/>inDate }}</code></li>
           <li><code>{<span/>{ m<span/>axDate }}</code></li>
           <li><code>{<span/>{ m<span/>inYear }}</code></li>
           <li><code>{<span/>{ m<span/>axYear }}</code></li>
           <li><code>{<span/>{ r<span/>egex }}</code></li>
          </ul>
        `,
      },
    ],
  };
};

export default editFormCustomError;
