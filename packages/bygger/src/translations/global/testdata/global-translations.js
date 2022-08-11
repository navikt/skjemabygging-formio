const translations = {
  en: [
    {
      id: "6192142b0892050003efd5d1",
      name: "global",
      scope: "global",
      tag: "skjematekster",
      translations: {
        Personopplysninger: {
          value: "Personal information",
          scope: "global",
        },
        Fornavn: {
          value: "First name",
          scope: "global",
        },
        Etternavn: {
          value: "Last name",
          scope: "global",
        },
      },
    },
    {
      id: "6183ff2454676700031b7cff",
      name: "global",
      scope: "global",
      tag: "validering",
      translations: {
        "For å gå videre må du rette opp følgende:": {
          value: "To proceed, you must correct the following:",
          scope: "global",
        },
        "{{field}} må være en gyldig epost-adresse.": {
          value: "{{field}} must be a valid email address.",
          scope: "global",
        },
        "{{field}} passer ikke til uttrykket {{regex}}.": {
          value: "{{field}} does not match the expression {{regex}}.",
          scope: "global",
        },
        "Dette er ikke et gyldig {{field}}.": {
          value: "This is not a valid {{field}}.",
          scope: "global",
        },
        "{{field}} kan ikke være større enn {{max}}.": {
          value: "{{field}} cannot be larger than {{max}}.",
          scope: "global",
        },
        "{{field}} kan ikke være mindre enn {{min}}.": {
          value: "{{field}} cannot be less than {{min}}.",
          scope: "global",
        },
        "{{field}} kan ikke være mer enn {{length}} tegn.": {
          value: "{{field}} cannot be longer than {{length}} characters.",
          scope: "global",
        },
        "{{field}} kan ikke være mindre enn {{length}} tegn.": {
          value: "{{field}} cannot be less than {{length}} characters.",
          scope: "global",
        },
        "{{field}} stemmer ikke med {{pattern}}": {
          value: "{{field}} does not match {{pattern}}",
          scope: "global",
        },
        "Du må fylle ut: {{field}}": {
          value: "You must fill in: {{field}}",
          scope: "global",
        },
        "{{field}} er ikke en gyldig dato.": {
          value: "{{field}} is not a valid date.",
          scope: "global",
        },
        "{{field}} er ikke en gyldig dag.": {
          value: "{{field}} is not a valid day.",
          scope: "global",
        },
        "{{field}} kan ikke inneholde dato etter {{- maxDate}}": {
          value: "{{field}} cannot contain date after {{- maxDate}}",
          scope: "global",
        },
        "{{field}} kan ikke inneholde dato før {{- minDate}}": {
          value: "{{field}} cannot contain date before {{- minDate}}",
          scope: "global",
        },
        "{{field}} kan ikke være senere enn {{maxYear}}": {
          value: "{{field}} cannot be later than {{maxYear}}",
          scope: "global",
        },
        "{{field}} kan ikke være før {{minYear}}": {
          value: "{{field}} cannot be before {{minYear}}",
          scope: "global",
        },
        alertMessage: {
          value: "{{message}}",
          scope: "global",
        },
        "Gyldig IBAN er ikke oppgitt": {
          value: "No IBAN was provided",
          scope: "global",
        },
        "Oppgitt IBAN har feil lengde.": {
          value: "The IBAN has wrong length",
          scope: "global",
        },
        "Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)": {
          value: "The IBAN contains an invalid country code (should be two capital letters at the start of the code)",
          scope: "global",
        },
        checksumNotNumber: {
          value: "The IBAN is invalid because the checksum is not a number",
          scope: "global",
        },
        wrongIBANChecksum: {
          value: "The IBAN has an incorrect checksum. Make sure you have entered it correctly.",
          scope: "global",
        },
        "Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig.": {
          value: "The IBAN is invalid. Make sure you have entered it correctly.",
          scope: "global",
        },
        "Dette er ikke et gyldig fødselsnummer eller D-nummer": {
          value: "This is not a valid Norwegian national identification number / D number",
          scope: "global",
        },
        "Datoen kan ikke være tidligere enn {{fromDate}}": {
          value: "The date cannot be earlier than {{fromDate}}",
          scope: "global",
        },
        "Datoen må være senere enn {{fromDate}}": {
          value: "The date must be later than {{fromDate}}",
          scope: "global",
        },
        "Datoen kan ikke være tidligere enn": {
          value: "The date can not be earlier than",
          scope: "global",
        },
        "Datoen kan ikke være tidligere enn {{minDate}} eller senere enn {{maxDate}}": {
          value: "Date cannot be earlier than {{minDate}} or later than {{maxDate}}",
          scope: "global",
        },
        "Datoen kan ikke være senere enn": {
          value: "The date can not be later than",
          scope: "global",
        },
      },
    },
    {
      id: "6183ecef33dfd600036b3f11",
      name: "global",
      scope: "global",
      tag: "statiske-tekster",
      translations: {
        Oppsummering: {
          value: "Summary",
          scope: "global",
        },
        "Last ned og skriv ut dokumentene til saken din": {
          value: "Download and print the documents for your case",
          scope: "global",
        },
        "Vennligst sjekk at alle svarene dine er riktige. Hvis du finner noe som må korrigeres trykker du på «{{editAnswers}}» på bunnen av denne siden. Hvis alle svarene er riktige går du videre til steg 2.":
          {
            value:
              'Please check that all your answers are correct. If you find something that needs to be corrected, press "{{editAnswers}}" at the bottom of this page. If all the answers are correct, proceed to step 2.',
            scope: "global",
          },
        "Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentene, og hvilken adresse de skal sendes til.":
          {
            value:
              "The cover sheet contains important information about the NAV unit that will receive the documents and the address to which the documents should be sent.",
            scope: "global",
          },
        "Legg ved": {
          value: "Attach",
          scope: "global",
        },
        "disse vedleggene": {
          value: "the following documents",
          scope: "global",
        },
        "dette vedlegget": {
          value: "the following document",
          scope: "global",
        },
        "Send det hele til NAV i posten": {
          value: "Send it all to NAV in the mail",
          scope: "global",
        },
        "Følg instruksjonene på førstesidearket for å sende dokumentene i posten.": {
          value: "Follow the instructions on the cover sheet  to send the documents in the mail.",
          scope: "global",
        },
        "Husk å legge ved": {
          value: "Remember to include",
          scope: "global",
        },
        vedleggene: {
          value: "the documents",
          scope: "global",
        },
        vedlegget: {
          value: "the document",
          scope: "global",
        },
        "som nevnt i punkt 2 over.": {
          value: "as mentioned in point 2 above.",
          scope: "global",
        },
        "Hva skjer videre?": {
          value: "What happens next?",
          scope: "global",
        },
        "Du hører fra oss så fort vi har sett på saken din. Vi tar kontakt med deg om vi mangler noe.": {
          value:
            "You will hear from oss as soon as we have processed your case. We will contact you if anything is missing.",
          scope: "global",
        },
        "1. Last ned den ferdig utfylte søknaden til enheten din": {
          value: '" 1. Download the completed application to your device"',
          scope: "global",
        },
        "Klikk på «{{downloadApplication}}». Da åpnes den ferdig utfylte søknaden din i en ny fane i nettleseren. ": {
          value:
            'Click "{{downloadApplication}}". This will open your completed application in a new tab in the browser.',
          scope: "global",
        },
        "Du må lagre søknaden (PDF) på enheten din slik at du enkelt kan finne den igjen.": {
          value: "You need to save the application (PDF) on your device so that you can easily find it again.",
          scope: "global",
        },
        "Etter at du har lastet ned og lagret søknaden din, må du laste den opp til NAV. Følg veiledningen i punkt 2 lenger ned på denne siden.":
          {
            value:
              "After you have downloaded and saved your application, you must upload it to NAV. Follow the instructions in point 2 further down this page.",
            scope: "global",
          },
        "2. Last opp søknaden din til NAV": {
          value: "2. Upload your application to NAV",
          scope: "global",
        },
        "Når du klikker på «Gå videre» åpnes det en ny side (krever innlogging) der du skal laste opp søknaden din.": {
          value:
            'When you click on "Proceed", a new page will open (login required) where you will upload your application.',
          scope: "global",
        },
        "På neste side laster du opp søknaden slik:": {
          value: "On the next page, upload the application as follows:",
          scope: "global",
        },
        "Trykk på «Fyll ut og last opp».": {
          value: "Press «Fyll ut og last opp».",
          scope: "global",
        },
        "Hopp over trinn 1 «Forbered skjema» og gå direkte til trinn 2 «Last opp skjema».": {
          value: "Skip step 1 «Forbered skjema» and proceed directly to step 2 «Last opp skjema».\n",
          scope: "global",
        },
        "Trykk på «Finn filen» og last opp søknaden som du lagret på enheten din.": {
          value: 'Click "Finn filen" and upload the application that you saved on your device.',
          scope: "global",
        },
        "Deretter må du laste opp eventuelle vedlegg. Trykk på «Bekreft» for å gå videre til innsending av søknaden. Trykk på knappen «Send til NAV» nederst på siden for å sende inn søknaden din.":
          {
            value:
              'Then you need to upload any attachments. Click on "Bekreft" to proceed to submitting the application. Click the "Send til NAV" button at the bottom of the page to submit your application.',
            scope: "global",
          },
        "Du må bekrefte at du har lest instruksjonene over før du kan gå videre.": {
          value: "You must confirm that you have read the instructions above before proceeding.",
          scope: "global",
        },
        "Du må laste ned søknaden din før du kan gå videre.": {
          value: "You must download your application before you can proceed.",
          scope: "global",
        },
        "Sted og dato": {
          value: "Place and date",
          scope: "global",
        },
        Underskrift: {
          value: "Signature",
          scope: "global",
        },
        "Skjemaet ble opprettet": {
          value: " The form was created",
          scope: "global",
        },
        Skjemaversjon: {
          value: "Form version",
          scope: "global",
        },
        "Laster...": {
          value: "Loading...",
          scope: "global",
        },
        "Vennligst sjekk at alle opplysningene dine er riktige. Hvis du finner noe som må korrigeres trykker du på «{{editAnswers}}» på bunnen av denne siden. Hvis alle opplysningene er riktige går du videre til steg 2.":
          {
            value:
              'Please check that all your information is correct. If you find something that needs to be corrected, click on "{{editAnswers}}" at the bottom of this page. If all the information is correct, go to point 2.',
            scope: "global",
          },
        "Velg enhet som skal behandle saken din": {
          value: "Select the NAV unit that will process your case",
          scope: "global",
        },
        "Du må velge enheten som skal behandle saken din": {
          value: "You must select the NAV unit that will process your case",
          scope: "global",
        },
        "Velg enhet": {
          value: "Select unit",
          scope: "global",
        },
        "Førsteside kan ikke genereres før du har valgt enhet": {
          value: "The cover sheet cannot be generated until you have selected the NAV unit that will process your case",
          scope: "global",
        },
        "En feil har oppstått. Vi kunne ikke laste enheter. Beklager ulempen, prøv igjen senere.": {
          value:
            "An error has occured. We could not load the NAV units. Sorry for the inconvenience, please try again later.",
          scope: "global",
        },
        "Klikk på «{{downloadApplication}}». Da åpnes det ferdig utfylte dokumentet i en ny fane i nettleseren. ": {
          value: 'Click "{{downloadApplication}}". This will open the completed document in a new tab in the browser.',
          scope: "global",
        },
        "Etter at du har lastet ned og lagret dokumentet, må du laste det opp til NAV. Følg veiledningen i punkt 2 lenger ned på denne siden.":
          {
            value:
              "After you have downloaded and saved the document, you must upload it to NAV. Follow the instructions in point 2 below.",
            scope: "global",
          },
        "Når du klikker på «Gå videre» åpnes det en ny side (krever innlogging) der du skal laste opp dokumentet.": {
          value:
            'When you click on "Proceed", a new page will open (requires login) where you can upload the document.',
          scope: "global",
        },
        "2. Last opp dokumentet til NAV": {
          value: "2. Upload the document to NAV",
          scope: "global",
        },
        "På neste side laster du opp dokumentet slik:": {
          value: "On the next page, upload the document as follows:",
          scope: "global",
        },
        "Trykk på «Finn filen» og last opp dokumentet som du lagret på enheten din.": {
          value: 'Press "Finn filen" and upload the document that you saved to your device.',
          scope: "global",
        },
        "Deretter må du laste opp eventuelle vedlegg. Trykk på «Bekreft» for å gå videre til innsending av dokumentene. Trykk på knappen «Send til NAV» nederst på siden for å sende dokumentene til NAV.":
          {
            value:
              'Then you need to upload any attachments. Press "Bekreft" to proceed to submitting the documents. Press the "Send til NAV" button at the bottom of the page to send the documents to NAV.',
            scope: "global",
          },
        "Du må laste ned det utfylte dokumentet før du kan gå videre.": {
          value: "You must download the completed document before you can proceed.",
          scope: "global",
        },
        "1. Last ned det ferdig utfylte dokumentet til enheten din": {
          value: "1. Download the completed document to your device",
          scope: "global",
        },
        "Du må lagre dokumentet (PDF) på enheten din slik at du enkelt kan finne det igjen.": {
          value: "You need to save the document (PDF) on your device so that you can easily find it again.",
          scope: "global",
        },
        "Vennligst sjekk at alle opplysningene dine er riktige. Hvis du finner noe som må korrigeres trykker du på «{{editAnswers}}» på bunnen av denne siden. Hvis alle opplysningene er riktige går du videre til neste steg.":
          {
            value:
              'Please check that all your information is correct. If you find something that needs to be corrected, click on "{{editAnswers}}" at the bottom of this page. If all the information is correct, go to the next step.',
            scope: "global",
          },
        "Dette er en tjeneste under utvikling": {
          value: "This is a service under development",
          scope: "global",
        },
        "Hvis du velger digital innsending må du laste ned søknaden og laste den opp igjen i neste steg.": {
          value:
            "If you choose digital submission, you must download the application and upload it again in the next step.",
          scope: "global",
        },
        "Digital innsending er vanskelig på iPad og iPhone.": {
          value: "Digital submission is difficult on iPad and iPhone.",
          scope: "global",
        },
        "Hvis du velger digital innsending må du laste ned søknaden i neste steg og laste den opp igjen etter innlogging.":
          {
            value:
              "If you choose digital submission, you must download the application in the next step and upload it again after logging in.",
            scope: "global",
          },
        "Skjemaet fylles ut digitalt, men skal sendes i posten.": {
          value: "The form is filled in digitally, but must be sent by post.",
          scope: "global",
        },
        "Etter utfylling må du laste ned det ferdig utfylte skjemaet som en pdf-fil, skrive det ut og sende i posten.":
          {
            value:
              "After filling in, you must download the completed form as a pdf file, print it out and send it by post.",
            scope: "global",
          },
        "Skjemaet er tilrettelagt for elektronisk utfylling.": {
          value: "The form must be filled in digitally.",
          scope: "global",
        },
        "Etter utfylling kan du velge mellom digital innsending (krever innlogging) eller sende det i posten. I begge tilfeller må du laste ned det ferdig utfylte skjemaet som en pdf-fil, som du så enten kan laste opp eller skrive ut og sende i posten.":
          {
            value:
              "After filling in, you can choose between digital submission (requires login) or send it by post. In both cases, you must download the completed form as a pdf file, which you can then either upload or print and send it by post.",
            scope: "global",
          },
        "De fleste feltene i skjemaet er påkrevd.": {
          value: "Most fields in the form are required.",
          scope: "global",
        },
        "Alle felter som ikke er påkrevd er merket med: (valgfritt).": {
          value: "All fields that are not required are marked with: (optional).",
          scope: "global",
        },
        "Du kan ikke lagre søknaden underveis.": {
          value: "It's not possible to save the form before it's finished.",
          scope: "global",
        },
        "Informasjonen du fyller inn i skjemaet sendes ikke til NAV før du har fullført hele søknaden og sendt den inn. Hvis du lukker vinduet / nettleseren vil all informasjon du har fylt ut forsvinne.":
          {
            value:
              "The information you fill in the form is not sent to NAV until you have completed the entire application and submitted it. If you close the window / browser, all the information you have filled in will be deleted.",
            scope: "global",
          },
        "Bruk av offentlig PC:": {
          value: "Use of public PC:",
          scope: "global",
        },
        "Hvis du fyller ut skjemaet på en offentlig PC (f.eks. på et bibliotek) er det viktig at du lukker nettleseren når du er ferdig. Dette vil forhindre uvedkommende fra å få tak i personinformasjonen din.":
          {
            value:
              "If you fill in the form on a public PC (e.g. in a library), it is important that you close the browser when you have finished. This will prevent unauthorized persons from accessing your personal information.",
            scope: "global",
          },
        "Vær oppmerksom på dette før du begynner å fylle ut søknaden": {
          value: "Please note this before you start filling in the application",
          scope: "global",
        },
        "Vær oppmerksom på dette før du begynner å fylle ut skjemaet": {
          value: "Please note this before you start filling in the form",
          scope: "global",
        },
        "Du kan ikke lagre skjemaet underveis.": {
          value: "The form cannot be saved before you are finished.",
          scope: "global",
        },
        "Informasjonen du fyller inn i skjemaet sendes ikke til NAV før du har fullført hele skjemaet og sendt det inn. Hvis du lukker vinduet / nettleseren vil all informasjon du har fylt ut forsvinne.":
          {
            value:
              "The information you fill in the form is not sent to NAV until you have completed the entire form and submitted it. If you close the window / browser, all the information you have filled in will disappear.",
            scope: "global",
          },
        "Du må fylle ut skjemaet digitalt, og deretter sende det i posten.": {
          value: "You must fill in the form digitally, and then send it by post.",
          scope: "global",
        },
        "Du må fylle ut skjemaet digitalt.": {
          value: "You must fill in the form digitally.",
          scope: "global",
        },
        "Du må fylle ut de fleste feltene i skjemaet.": {
          value: "You must fill in most of the fields in the form.",
          scope: "global",
        },
        "Felt som ikke er nødvendige er merket med: (valgfritt).": {
          value: "Fields that are not required are marked with: (optional).",
          scope: "global",
        },
      },
    },
    {
      id: "6183ccd633dfd600036b3e92",
      name: "global",
      scope: "global",
      tag: "grensesnitt",
      translations: {
        Forrige: {
          value: "Previous",
          scope: "global",
        },
        Neste: {
          value: "Next",
          scope: "global",
        },
        Avbryt: {
          value: "Cancel",
          scope: "global",
        },
        "Er du sikker på at du vil avbryte?": {
          value: "Are you sure you want to cancel?",
          scope: "global",
        },
        "Legg til": {
          value: "Add",
          scope: "global",
        },
        Fjern: {
          value: "Remove",
          scope: "global",
        },
        "Last ned søknaden": {
          value: "Download application",
          scope: "global",
        },
        "Gå tilbake": {
          value: "Go back",
          scope: "global",
        },
        "Gå videre": {
          value: "Proceed",
          scope: "global",
        },
        "Send i posten": {
          value: "Submit by mail",
          scope: "global",
        },
        "Til digital innsending": {
          value: "To digital submission",
          scope: "global",
        },
        "Last ned førsteside": {
          value: "Download cover sheet",
          scope: "global",
        },
        "Jeg har lest instruksjonene.": {
          value: "I have read the instructions.",
          scope: "global",
        },
        Ja: {
          value: "Yes",
          scope: "global",
        },
        Nei: {
          value: "No",
          scope: "global",
        },
        valgfritt: {
          value: "optional",
          scope: "global",
        },
        Januar: {
          value: "January",
          scope: "global",
        },
        Februar: {
          value: "February",
          scope: "global",
        },
        Mars: {
          value: "March",
          scope: "global",
        },
        April: {
          value: "April",
          scope: "global",
        },
        Mai: {
          value: "May",
          scope: "global",
        },
        Juni: {
          value: "June",
          scope: "global",
        },
        Juli: {
          value: "July",
          scope: "global",
        },
        August: {
          value: "August",
          scope: "global",
        },
        September: {
          value: "September",
          scope: "global",
        },
        Oktober: {
          value: "October",
          scope: "global",
        },
        November: {
          value: "Novemeber",
          scope: "global",
        },
        Desember: {
          value: "December",
          scope: "global",
        },
        Måned: {
          value: "Month",
          scope: "global",
        },
        Dag: {
          value: "Day",
          scope: "global",
        },
        År: {
          value: "Year",
          scope: "global",
        },
        "Vær oppmerksom på": {
          value: "Please note",
          scope: "global",
        },
        "Rediger opplysningene": {
          value: "Edit information",
          scope: "global",
        },
        Avslutt: {
          value: "Exit",
          scope: "global",
        },
        OK: {
          value: "OK",
          scope: "global",
        },
        Start: {
          value: "Start",
          scope: "global",
        },
      },
    },
  ],
  "nn-NO": [
    {
      id: "6183eb1b33dfd600036b3eec",
      name: "global",
      scope: "global",
      tag: "statiske-tekster",
      translations: {
        Oppsummering: {
          value: "Oppsummering",
          scope: "global",
        },
        "Vennligst sjekk at alle svarene dine er riktige. Hvis du finner noe som må korrigeres trykker du på «{{editAnswers}}» på bunnen av denne siden. Hvis alle svarene er riktige går du videre til steg 2.":
          {
            value:
              "Vennlegast sjekk at alle svara dine er riktige. Viss du finn noko som må korrigerast trykkar du på «{{editAnswers}}» på botnen av denne sida. Viss alle svara er riktige går du vidare til steg 2.",
            scope: "global",
          },
        "Last ned og skriv ut dokumentene til saken din": {
          value: "Last ned og skriv ut dokumenta til saka di",
          scope: "global",
        },
        "Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentene, og hvilken adresse de skal sendes til.":
          {
            value:
              "Førstesidearket inneheld viktig informasjon om kva eining i NAV som skal motta dokumenta, og kva adresse dei skal sendast til.",
            scope: "global",
          },
        "Legg ved": {
          value: "Legg ved",
          scope: "global",
        },
        "disse vedleggene": {
          value: "desse vedlagga",
          scope: "global",
        },
        "dette vedlegget": {
          value: "dette vedlegget",
          scope: "global",
        },
        "Send det hele til NAV i posten": {
          value: "Send det heile til NAV i posten",
          scope: "global",
        },
        "Følg instruksjonene på førstesidearket for å sende dokumentene i posten.": {
          value: "Følg instruksjonane på førstesidearket for å sende dokumenta i posten.",
          scope: "global",
        },
        "Husk å legge ved": {
          value: "Hugs å legge ved",
          scope: "global",
        },
        vedleggene: {
          value: "vedlegga",
          scope: "global",
        },
        vedlegget: {
          value: "vedlegget",
          scope: "global",
        },
        "som nevnt i punkt 2 over.": {
          value: "som nemnt i punkt 2 over.",
          scope: "global",
        },
        "Hva skjer videre?": {
          value: "Kva skjer vidare?",
          scope: "global",
        },
        "Du hører fra oss så fort vi har sett på saken din. Vi tar kontakt med deg om vi mangler noe.": {
          value: "Du høyrer frå oss så fort vi har sett på saka di. Vi tar kontakt med deg om vi manglar noko.",
          scope: "global",
        },
        "1. Last ned den ferdig utfylte søknaden til enheten din": {
          value: "1. Last ned den ferdig utfylte søknaden til eininga di",
          scope: "global",
        },
        "Klikk på «{{downloadApplication}}». Da åpnes den ferdig utfylte søknaden din i en ny fane i nettleseren. ": {
          value:
            "Klikk på «{{downloadApplication}}». Då blir den ferdig utfylte søknaden din opna i ei ny fane i nettlesaren.",
          scope: "global",
        },
        "Du må lagre søknaden (PDF) på enheten din slik at du enkelt kan finne den igjen.": {
          value: "Du må lagre søknaden (PDF) på eininga di slik at du enkelt kan finne ho igjen.",
          scope: "global",
        },
        "Etter at du har lastet ned og lagret søknaden din, må du laste den opp til NAV. Følg veiledningen i punkt 2 lenger ned på denne siden.":
          {
            value:
              "Etter at du har lasta ned og lagra søknaden din, må du laste han opp til NAV. Følg rettleiinga i punkt 2 lengre ned på denne sida.",
            scope: "global",
          },
        "2. Last opp søknaden din til NAV": {
          value: "2. Last opp søknaden din til NAV",
          scope: "global",
        },
        "Når du klikker på «Gå videre» åpnes det en ny side (krever innlogging) der du skal laste opp søknaden din.": {
          value:
            "Når du klikkar på «Gå vidare» blir det opna ei ny side (krev innlogging) der du skal laste opp søknaden din.",
          scope: "global",
        },
        "På neste side laster du opp søknaden slik:": {
          value: "På neste side lastar du opp søknaden slik:",
          scope: "global",
        },
        "Trykk på «Fyll ut og last opp».": {
          value: "Trykk på «Fyll ut og last opp».",
          scope: "global",
        },
        "Hopp over trinn 1 «Forbered skjema» og gå direkte til trinn 2 «Last opp skjema».": {
          value: "Hopp over trinn 1 «Forbered skjema» og gå direkte til trinn 2 «Last opp skjema».",
          scope: "global",
        },
        "Trykk på «Finn filen» og last opp søknaden som du lagret på enheten din.": {
          value: "Trykk på «Finn fila» og last opp søknaden som du lagra på eininga di.",
          scope: "global",
        },
        "Deretter må du laste opp eventuelle vedlegg. Trykk på «Bekreft» for å gå videre til innsending av søknaden. Trykk på knappen «Send til NAV» nederst på siden for å sende inn søknaden din.":
          {
            value:
              "Deretter må du laste opp eventuelle vedlegg. Trykk på «Bekreft» for å gå vidare til innsending av søknaden. Trykk på knappen «Send til NAV» nedst på sida for å sende inn søknaden din.",
            scope: "global",
          },
        "Du må bekrefte at du har lest instruksjonene over før du kan gå videre.": {
          value: "Du må bekrefte at du har lese instruksjonane over før du kan gå vidare.",
          scope: "global",
        },
        "Du må laste ned søknaden din før du kan gå videre.": {
          value: "Du må laste ned søknaden din før du kan gå vidare.",
          scope: "global",
        },
        "Sted og dato": {
          value: "Stad og dato",
          scope: "global",
        },
        Underskrift: {
          value: "Underskrift",
          scope: "global",
        },
        "Skjemaet ble opprettet": {
          value: "Skjemaet vart oppretta",
          scope: "global",
        },
        Skjemaversjon: {
          value: "Skjemaversjon",
          scope: "global",
        },
        "Laster...": {
          value: "Laster...",
          scope: "global",
        },
        "Vennligst sjekk at alle opplysningene dine er riktige. Hvis du finner noe som må korrigeres trykker du på «{{editAnswers}}» på bunnen av denne siden. Hvis alle opplysningene er riktige går du videre til steg 2.":
          {
            value:
              "Ver vennleg og sjekk at alle opplysningane dine er riktige. Viss du finn noko som må korrigerast trykkar du på «{{editAnswers}}» på botnen av denne sida. Viss alle opplysningane er riktige går du vidare til steg 2.",
            scope: "global",
          },
        "Velg enhet som skal behandle saken din": {
          value: "Vel eining som skal behandla saka di",
          scope: "global",
        },
        "Du må velge enheten som skal behandle saken din": {
          value: "Du må velja eininga som skal behandla saka di",
          scope: "global",
        },
        "Velg enhet": {
          value: "Vel eining",
          scope: "global",
        },
        "Førsteside kan ikke genereres før du har valgt enhet": {
          value: "Førsteside kan ikkje genererast før du har valt eining",
          scope: "global",
        },
        "En feil har oppstått. Vi kunne ikke laste enheter. Beklager ulempen, prøv igjen senere.": {
          value: "Ein feil har oppstått. Vi kunne ikkje laste einingar. Beklagar ulempen, prøv igjen seinare.",
          scope: "global",
        },
        "Klikk på «{{downloadApplication}}». Da åpnes det ferdig utfylte dokumentet i en ny fane i nettleseren. ": {
          value:
            "Klikk på «{{downloadApplication}}». Då blir det ferdig utfylte dokumentet opna i ei ny fane i nettlesaren.",
          scope: "global",
        },
        "Etter at du har lastet ned og lagret dokumentet, må du laste det opp til NAV. Følg veiledningen i punkt 2 lenger ned på denne siden.":
          {
            value:
              "Etter at du har lasta ned og lagra dokumentet, må du laste det opp til NAV. Følg rettleiinga i punkt 2 lengre ned på denne sida.",
            scope: "global",
          },
        "2. Last opp dokumentet til NAV": {
          value: "2. Last opp dokumentet til NAV",
          scope: "global",
        },
        "Når du klikker på «Gå videre» åpnes det en ny side (krever innlogging) der du skal laste opp dokumentet.": {
          value:
            "Når du klikkar på «Gå vidare» blir det opna ei ny side (krev innlogging) der du skal laste opp dokumentet.",
          scope: "global",
        },
        "På neste side laster du opp dokumentet slik:": {
          value: "På neste side lastar du opp dokumentet slik:",
          scope: "global",
        },
        "Trykk på «Finn filen» og last opp dokumentet som du lagret på enheten din.": {
          value: "Trykk på «Finn fila» og last opp dokumentet som du lagra på eininga di.",
          scope: "global",
        },
        "Deretter må du laste opp eventuelle vedlegg. Trykk på «Bekreft» for å gå videre til innsending av dokumentene. Trykk på knappen «Send til NAV» nederst på siden for å sende dokumentene til NAV.":
          {
            value:
              "Deretter må du laste opp eventuelle vedlegg. Trykk på «Bekreft» for å gå vidare til innsending av dokumenta. Trykk på knappen «Send til NAV» nedst på sida for å senda dokumenta til NAV.",
            scope: "global",
          },
        "Du må laste ned det utfylte dokumentet før du kan gå videre.": {
          value: "Du må laste ned det utfylte dokumentet før du kan gå vidare.",
          scope: "global",
        },
        "1. Last ned det ferdig utfylte dokumentet til enheten din": {
          value: "1. Last ned det ferdig utfylte dokumentet til eininga di",
          scope: "global",
        },
        "Du må lagre dokumentet (PDF) på enheten din slik at du enkelt kan finne det igjen.": {
          value: "Du må lagre dokumentet (PDF) på eininga di slik at du enkelt kan finna det igjen.",
          scope: "global",
        },
        "Vennligst sjekk at alle opplysningene dine er riktige. Hvis du finner noe som må korrigeres trykker du på «{{editAnswers}}» på bunnen av denne siden. Hvis alle opplysningene er riktige går du videre til neste steg.":
          {
            value:
              "Ver vennleg og sjekk at alle opplysningane dine er riktige. Viss du finn noko som må korrigerast trykkar du på «{{editAnswers}}» på botnen av denne sida. Viss alle opplysningane er riktige går du vidare til neste steg.",
            scope: "global",
          },
        "Dette er en tjeneste under utvikling": {
          value: "Dette er ei teneste under utvikling",
          scope: "global",
        },
        "Hvis du velger digital innsending må du laste ned søknaden og laste den opp igjen i neste steg.": {
          value: "Viss du vel digital innsending må du laste ned søknaden og laste han opp igjen i neste steg.",
          scope: "global",
        },
        "Digital innsending er vanskelig på iPad og iPhone.": {
          value: "Digital innsending er vanskeleg på iPad og iPhone.",
          scope: "global",
        },
        "Hvis du velger digital innsending må du laste ned søknaden i neste steg og laste den opp igjen etter innlogging.":
          {
            value:
              "Viss du vel digital innsending må du laste ned søknaden i neste steg og laste han opp igjen etter innlogging.",
            scope: "global",
          },
        "Skjemaet fylles ut digitalt, men skal sendes i posten.": {
          value: "Skjemaet blir fylt ut digitalt, men skal sendast i posten.",
          scope: "global",
        },
        "Etter utfylling må du laste ned det ferdig utfylte skjemaet som en pdf-fil, skrive det ut og sende i posten.":
          {
            value:
              "Etter utfylling må du laste ned det ferdig utfylte skjemaet som ei pdf-fil, skrive det ut og sende i posten.",
            scope: "global",
          },
        "Skjemaet er tilrettelagt for elektronisk utfylling.": {
          value: "Skjemaet er tilrettelagt for elektronisk utfylling.",
          scope: "global",
        },
        "Etter utfylling kan du velge mellom digital innsending (krever innlogging) eller sende det i posten. I begge tilfeller må du laste ned det ferdig utfylte skjemaet som en pdf-fil, som du så enten kan laste opp eller skrive ut og sende i posten.":
          {
            value:
              "Etter utfylling kan du velge mellom å sende skjemaet digitalt (krever innlogging) eller å sende det i posten. I begge tilfelle må du laste ned det ferdig utfylte skjemaet som ei pdf-fil, som du enten kan laste opp eller skrive ut og sende i posten.",
            scope: "global",
          },
        "De fleste feltene i skjemaet er påkrevd.": {
          value: "Dei fleste felta i skjemaet er påkravd.",
          scope: "global",
        },
        "Alle felter som ikke er påkrevd er merket med: (valgfritt).": {
          value: "Alle felt som ikkje er påkravde er merka med: (valfritt).",
          scope: "global",
        },
        "Du kan ikke lagre søknaden underveis.": {
          value: "Du kan ikkje lagra søknaden undervegs.",
          scope: "global",
        },
        "Informasjonen du fyller inn i skjemaet sendes ikke til NAV før du har fullført hele søknaden og sendt den inn. Hvis du lukker vinduet / nettleseren vil all informasjon du har fylt ut forsvinne.":
          {
            value:
              "Informasjonen du fyller inn i skjemaet blir ikkje sendt til NAV før du har fullført heile søknaden og sendt den inn. Viss du lukkar vindauget / nettlesaren vil all informasjon du har fylt ut forsvinna.",
            scope: "global",
          },
        "Bruk av offentlig PC:": {
          value: "Bruk av offentleg PC:",
          scope: "global",
        },
        "Hvis du fyller ut skjemaet på en offentlig PC (f.eks. på et bibliotek) er det viktig at du lukker nettleseren når du er ferdig. Dette vil forhindre uvedkommende fra å få tak i personinformasjonen din.":
          {
            value:
              "Viss du fyller ut skjemaet på ein offentleg PC (t.d. på eit bibliotek) er det viktig at du lukker nettlesaren når du er ferdig. Dette vil hindre uvedkomande i å få tak i personinformasjonen din.",
            scope: "global",
          },
        "Vær oppmerksom på dette før du begynner å fylle ut søknaden": {
          value: "Ver merksam på dette før du byrjar å fylla ut søknaden",
          scope: "global",
        },
        "Vær oppmerksom på dette før du begynner å fylle ut skjemaet": {
          value: "Ver merksam på dette før du begynner å fylle ut skjemaet",
          scope: "global",
        },
        "Du kan ikke lagre skjemaet underveis.": {
          value: "Du kan ikkje lagre skjemaet undervegs.",
          scope: "global",
        },
        "Informasjonen du fyller inn i skjemaet sendes ikke til NAV før du har fullført hele skjemaet og sendt det inn. Hvis du lukker vinduet / nettleseren vil all informasjon du har fylt ut forsvinne.":
          {
            value:
              "Informasjonen du fyller inn i skjemaet blir ikkje sendt til NAV før du har fullført heile skjemaet og sendt det inn. Viss du lukker vindauget / nettlesaren vil all informasjon du har fylt ut forsvinne.",
            scope: "global",
          },
        "Du må fylle ut skjemaet digitalt, og deretter sende det i posten.": {
          value: "Du må fylle ut skjemaet digitalt, og deretter sende det i posten.",
          scope: "global",
        },
        "Du må fylle ut skjemaet digitalt.": {
          value: "Du må fylle ut skjemaet digitalt.",
          scope: "global",
        },
        "Du må fylle ut de fleste feltene i skjemaet.": {
          value: "Du må fylle ut dei fleste felta i skjemaet.",
          scope: "global",
        },
        "Felt som ikke er nødvendige er merket med: (valgfritt).": {
          value: "Felt som ikkje er nødvendig er markert med: (valfritt).",
          scope: "global",
        },
      },
    },
    {
      id: "6183c62933dfd600036b3e86",
      name: "global",
      scope: "global",
      tag: "validering",
      translations: {
        "{{field}} kan ikke være mindre enn {{min}}.": {
          value: "{{field}} kan ikkje vere mindre enn {{min}}.",
          scope: "global",
        },
        "Du må fylle ut: {{field}}": {
          value: "Du må fylle ut: {{field}}",
          scope: "global",
        },
        "For å gå videre må du rette opp følgende:": {
          value: "For å gå vidare må du retta opp følgjande:",
          scope: "global",
        },
        "{{field}} må være en gyldig epost-adresse.": {
          value: "{{field}} må vera ei gyldig epost-adresse.",
          scope: "global",
        },
        "{{field}} passer ikke til uttrykket {{regex}}.": {
          value: "{{field}} passar ikkje til uttrykket {{regex}}.",
          scope: "global",
        },
        "Dette er ikke et gyldig {{field}}.": {
          value: "Dette er ikkje eit gyldig {{field}}.",
          scope: "global",
        },
        "{{field}} kan ikke være større enn {{max}}.": {
          value: "{{field}} kan ikkje vera større enn {{max}}.",
          scope: "global",
        },
        "{{field}} kan ikke være mer enn {{length}} tegn.": {
          value: "{{field}} kan ikkje vera meir enn {{length}} teikn.",
          scope: "global",
        },
        "{{field}} kan ikke være mindre enn {{length}} tegn.": {
          value: "{{field}} kan ikkje vera mindre enn {{length}} teikn.",
          scope: "global",
        },
        "{{field}} stemmer ikke med {{pattern}}": {
          value: "{{field}} stemmer ikkje med {{pattern}}",
          scope: "global",
        },
        "{{field}} er ikke en gyldig dato.": {
          value: "{{field}} er ikkje ein gyldig dato.",
          scope: "global",
        },
        "{{field}} er ikke en gyldig dag.": {
          value: "{{field}} er ikkje ein gyldig dag.",
          scope: "global",
        },
        "{{field}} kan ikke inneholde dato etter {{- maxDate}}": {
          value: "{{field}} kan ikkje innehalda dato etter {{- maxDate}}",
          scope: "global",
        },
        "{{field}} kan ikke inneholde dato før {{- minDate}}": {
          value: "{{field}} kan ikkje innehalda dato før {{- minDate}}",
          scope: "global",
        },
        "{{field}} kan ikke være senere enn {{maxYear}}": {
          value: "{{field}} kan ikkje vera seinare enn {{maxYear}}",
          scope: "global",
        },
        "{{field}} kan ikke være før {{minYear}}": {
          value: "{{field}} kan ikkje vera før {{minYear}}",
          scope: "global",
        },
        alertMessage: {
          value: "{{message}}",
          scope: "global",
        },
        "Gyldig IBAN er ikke oppgitt": {
          value: "Gyldig IBAN er ikkje oppgitt",
          scope: "global",
        },
        "Oppgitt IBAN har feil lengde.": {
          value: "Oppgitt IBAN har feil lengde.",
          scope: "global",
        },
        "Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)": {
          value: "Oppgitt IBAN inneheld ugyldig landskode (to store bokstavar i starten av IBAN-koden)",
          scope: "global",
        },
        "Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig.": {
          value: "Oppgitt IBAN er ugyldig. Sjekk at du har tasta riktig.",
          scope: "global",
        },
        "Dette er ikke et gyldig fødselsnummer eller D-nummer": {
          value: "Dette er ikkje eit gyldig fødselsnummer eller D-nummer",
          scope: "global",
        },
        "Datoen kan ikke være tidligere enn {{fromDate}}": {
          value: "Datoen kan ikkje vera tidlegare enn {{fromDate}}",
          scope: "global",
        },
        "Datoen må være senere enn {{fromDate}}": {
          value: "Datoen må vera seinare enn {{fromDate}}",
          scope: "global",
        },
        "Datoen kan ikke være tidligere enn": {
          value: "Datoen kan ikkje vera tidlegare enn",
          scope: "global",
        },
        "Datoen kan ikke være tidligere enn {{minDate}} eller senere enn {{maxDate}}": {
          value: "Datoen kan ikkje vera tidlegare enn {{minDate}} eller seinare enn {{maxDate}}",
          scope: "global",
        },
        "Datoen kan ikke være senere enn": {
          value: "Datoen kan ikkje vera seinare enn",
          scope: "global",
        },
      },
    },
    {
      id: "6166e450a223df0003b55011",
      name: "global",
      scope: "global",
      tag: "grensesnitt",
      translations: {
        Ja: {
          value: "Ja",
          scope: "global",
        },
        Nei: {
          value: "Nei",
          scope: "global",
        },
        Neste: {
          value: "Neste",
          scope: "global",
        },
        Avbryt: {
          value: "Avbryt",
          scope: "global",
        },
        "Er du sikker på at du vil avbryte?": {
          value: "Er du sikker på at du vil avbryte?",
          scope: "global",
        },
        "Legg til": {
          value: "Legg til",
          scope: "global",
        },
        Fjern: {
          value: "Fjern",
          scope: "global",
        },
        "Last ned søknaden": {
          value: "Last ned søknaden",
          scope: "global",
        },
        "Gå tilbake": {
          value: "Gå attende",
          scope: "global",
        },
        "Gå videre": {
          value: "Gå vidare",
          scope: "global",
        },
        "Rediger søknaden": {
          value: "Rediger søknaden",
          scope: "global",
        },
        "Send i posten": {
          value: "Send i posten",
          scope: "global",
        },
        "Til digital innsending": {
          value: "Til digital innsending",
          scope: "global",
        },
        "Last ned førsteside": {
          value: "Last ned førsteside",
          scope: "global",
        },
        "Jeg har lest instruksjonene.": {
          value: "Eg har lese instruksjonane.",
          scope: "global",
        },
        valgfritt: {
          value: "valfritt",
          scope: "global",
        },
        Januar: {
          value: "Januar",
          scope: "global",
        },
        Februar: {
          value: "Februar",
          scope: "global",
        },
        Mars: {
          value: "Mars",
          scope: "global",
        },
        April: {
          value: "April",
          scope: "global",
        },
        Juni: {
          value: "Juni",
          scope: "global",
        },
        Juli: {
          value: "Juli",
          scope: "global",
        },
        August: {
          value: "August",
          scope: "global",
        },
        September: {
          value: "September",
          scope: "global",
        },
        Oktober: {
          value: "Oktober",
          scope: "global",
        },
        November: {
          value: "November",
          scope: "global",
        },
        Desember: {
          value: "Desember",
          scope: "global",
        },
        Måned: {
          value: "Månad",
          scope: "global",
        },
        Dag: {
          value: "Dag",
          scope: "global",
        },
        År: {
          value: "År",
          scope: "global",
        },
        Mai: {
          value: "Mai",
          scope: "global",
        },
        "Vær oppmerksom på": {
          value: "Ver merksam på",
          scope: "global",
        },
        "Rediger opplysningene": {
          value: "Rediger opplysningane",
          scope: "global",
        },
        Avslutt: {
          value: "Avslutt",
          scope: "global",
        },
        OK: {
          value: "OK",
          scope: "global",
        },
        Start: {
          value: "Start",
          scope: "global",
        },
        Forrige: {
          value: "Førre",
          scope: "global",
        },
      },
    },
    {
      id: "6165499e00e3bc0003c9da5c",
      name: "global",
      scope: "global",
      tag: "skjematekster",
      translations: {
        Personopplysninger: {
          value: "Personopplysningar",
          scope: "global",
        },
        Fornavn: {
          value: "Fornamn",
          scope: "global",
        },
        Etternavn: {
          value: "Etternamn",
          scope: "global",
        },
      },
    },
  ],
};

export default translations;
