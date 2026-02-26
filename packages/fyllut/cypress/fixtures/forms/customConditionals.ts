export const customConditionals: Record<string, string[]> = {
  nav020705: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv === "ja") &&
       (data.onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg === "ja");`,
    `show = (data.forHvilkenPeriodeSkalDennePersonenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode") ||
       (data.forHvilkenPeriodeSkalDenneVirksomhetenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode");`,
    `show=
(data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegHarFullmakt") ||
(data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegRepresentererEnVirksomhetMedFullmakt");`,
    `show = (data.fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv === "ja") &&
       (data.onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg === "ja");`,
  ],
  nav020805: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.hvilkenTrygdedekningSokerDuOm === "helsedelen") ||
(data.hvilkenTrygdedekningSokerDuOm === "badeHelseOgPensjonsdelen");`,
    `show=
(data.lonnsmottaker2.erDuSendtUtAvEnNorskArbeidsgiverForAJobbeIUtlandet === "ja") ||
(data.lonnsmottaker2.skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver === "norsk");`,
    `show=
(data.norskArbeidsgiver.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
    `show=
(data.norskArbeidsgiver.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
    `show=
(data.norskArbeidsgiver.jegVetIkkeHvaVirksomhetsnummeretEr === true);`,
    `show=
(data.annenNorskVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
    `show=
(data.annenNorskVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
    `show=
(data.annenNorskVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr === true);`,
    `show=
(data.lonnsmottaker2.skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver === "utenlandsk") ||
(data.norskArbeidsgiver.hvemLonnesDuAvISoknadsperioden === "enUtenlandskVirksomhet");`,
    `show=
(data.norskArbeidsgiver.hvemLonnesDuAvISoknadsperioden === "enUtenlandskVirksomhet");`,
    `show=

(data.lonnsmottaker2.skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver === "utenlandsk");`,
    `show=
(data.hvordanFinansiererDuStudiene.privatFinansieringFEksSparepengerEllerBanklan === true) ||
(data.hvordanFinansiererDuStudiene.annet === true);`,
    `show=
(data.hvordanFinansiererDuStudiene.privatFinansieringFEksSparepengerEllerBanklan === true);`,
    `show=
(data.finansieresStudieneFraNorge === "nei") ||
(data.hvordanFinansiererDuStudiene.lanStipendFraAnnenInstitusjon === true);`,
    `show = (data.hvaErDinArbeidssituasjonIPerioden1.auPairPraktikantEllerArbeidVedSidenAvStudier === true) ||
       (data.hvordanFinansiererDuStudiene.arbeidsinntekt === true);`,
    `show=
(data.auPairPraktikantEllerArbeidVedSidenAvStudier2.iHvilkenVirksomhetSkalArbeidetUtfores === "iAnnenVirksomhet");`,
    `show=
(data.hvaErDinArbeidssituasjonIPerioden1.lonnsmottaker === true) ||
(data.hvaErDinArbeidssituasjonIPerioden1.selvstendigNaeringsdrivende === true);`,
    `show=
(row.arbeiderDuIEnRotasjonsordning1 === "ja") ||
(row.arbeiderDuIEnRotasjonsordning === "ja");`,
    `show=
(data.skalDuArbeideEllerDriveNaeringIUtlandet === "ja") ||
(data.hvordanFinansiererDuStudiene?.arbeidsinntekt === true);`,
    `show = (data.norskVirksomhet.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bolig === true);`,
    `show = (data.norskVirksomhet.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bil === true);`,
    `show = (data.norskVirksomhet.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.andreNaturalytelser === true);`,
    `show = (data.utenlandskVirksomhet1.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bolig === true);`,
    `show = (data.utenlandskVirksomhet1.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bil === true);`,
    `show = (data.utenlandskVirksomhet1.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.andreNaturalytelser === true);`,
    `show=
(data.mottarDuPensjonFraNav === "nei") ||
(data.mottarDuITilleggPensjonFraAndreOrdningerOffentligePrivateEllerUtenlandske === "ja");`,
    `show=
(data.skalDuArbeideEllerDriveNaeringIUtlandet === "ja") ||
(data.mottarDuPensjonFraNav === "nei") ||
(data.hvordanFinansiererDuStudiene.arbeidsinntekt === true);`,
    `show = (data.fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv === "ja") &&
       (data.onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg === "ja");`,
    `show = (data.forHvilkenPeriodeSkalDennePersonenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode") ||
       (data.forHvilkenPeriodeSkalDenneVirksomhetenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode");`,
    `show = (data.forHvilkenPeriodeSkalDennePersonenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode") ||
       (data.forHvilkenPeriodeSkalDenneVirksomhetenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode");`,
    `show = (data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegHarFullmakt") ||
       (data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegRepresentererEnVirksomhetMedFullmakt");`,
    `show = (data.fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv === "ja") &&
       (data.onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg === "ja");`,
    `show=
_.some(data.barnUnder18ArSomSkalVaereMedTilUtlandet, (rad) => {return (rad.barnetHarIkkeNorskFodselsnummerDNummer === true);});`,
  ],
  nav020807: [
    `show = (data.hvaErDinRolle === "jegHarFullmakt")
    || (data.hvaErDinRolle === "jegErForesattEllerVerge");`,
    `show = (data.hvilketLandSkalDuTil2 === 'annetEOSland') &&
       (data.hvorSkalDuStudere === 'vedEtNorskLaerested')
    || (data.hvorSkalDuStudere === 'jegFolgerNettstudierIUtlandet');`,
    `show = (data.skalDuJobbeForEnNorskEllerUtenlandskVirksomhet === "utenlandskVirksomhet")
    || (data.skalDuJobbeForEnNorskEllerUtenlandskVirksomhet === "norskVirksomhet");`,
    `show = (data.skalDuJobbeForEnNorskEllerUtenlandskVirksomhet === "norskVirksomhet")
    && (data.jegVetIkkeHvaOrganisasjonsnummeretEr2 !== true);`,
    `show = data.skalDuJobbeForEnNorskEllerUtenlandskVirksomhet === "norskVirksomhet" &&
data.velgLand !== "norge" && data.velgLand !== "";`,
    `show = (data.erDenneVirksomhetenNorskEllerUtenlandsk === "utenlandskVirksomhet")
    || (data.erDenneVirksomhetenNorskEllerUtenlandsk === "norskVirksomhet");`,
    `show = (data.erDenneVirksomhetenNorskEllerUtenlandsk === "norskVirksomhet")
    && (data.jegVetIkkeHvaOrganisasjonsnummeretEr === false);`,
    `show = (data.skalDuArbeideForEnNorskEllerUtenlandskVirksomhet === "utenlandskVirksomhet")
    || (data.skalDuArbeideForEnNorskEllerUtenlandskVirksomhet === "norskVirksomhet");`,
    `show = (data.skalDuArbeideForEnNorskEllerUtenlandskVirksomhet === "norskVirksomhet")
    && (data.jegVetIkkeHvaOrganisasjonsnummeretEr1 === false);`,
    `show = (row.erDenneVirksomhetenNorskEllerUtenlandsk === "utenlandskVirksomhet") &&
       (row.hvaErDinArbeidssituasjon === "arbeidstaker");`,
    `show = (data.hvaSkalDuGjoreIPerioden === "jegSkalArbeideIEttAnnetEosLandEllerSveits") ||
       (data.hvordanBetalerDuForStudiene.medArbeidIStudielandet === true);`,
    `show = (data.hvaJobberDuSomIDenneVirksomheten === "arbeidstakerEllerFrilanser") &&
       (data.fastArbeidssted.skalDuHaHjemmekontorSomDittFasteArbeidsstedIDetteLandet === "ja");`,
    `show = (data.hvaJobberDuSomIDenneVirksomheten === "arbeidstakerEllerFrilanser") &&
       (data.paEnAnnenAdresse.skalDuHaHjemmekontorSomDittFasteArbeidsstedIDetteLandet === "ja");`,
    `show = (data.hvaJobberDuSomIDenneVirksomheten === "arbeidstakerEllerFrilanser") &&
       (data.fastArbeidssted.skalDuHaHjemmekontorSomDittFasteArbeidsstedIDetteLandet === "ja");`,
    `show = (data.hvaJobberDuSomIDenneVirksomheten === "arbeidstakerEllerFrilanser") &&
       (data.paEnAnnenAdresse.skalDuHaHjemmekontorSomDittFasteArbeidsstedIDetteLandet === "ja");`,
    `show = (data.iHvilketLandOppholderDuDegStortSettNarDuIkkeArbeider === "nei") &&
       (data.erEtAvLandeneDuSkalJobbeINorge === "ja") &&
       (data.iNorge.hvorMyeForventerDuAJobbeINorgeIPeriodenDuSokerFor === "25ProsentEllerMer");`,
    `show = (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "enVirksomhet") ||
       (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "toVirksomheter") ||
       (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "treVirksomheter") ||
       (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "merEnnTreVirksomheter");`,
    `show = (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "toVirksomheter") ||
       (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "treVirksomheter") ||
       (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "merEnnTreVirksomheter");`,
    `show = (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "treVirksomheter") ||
       (data.hvorMangeArbeidsgivereEllerVirksomheterSkalDuJobbeForIPeriodenDuSokerFor === "merEnnTreVirksomheter");`,
    `show = (data.hvordanBetalerDuForStudiene.medArbeidIStudielandet === true)
    || (data.skalDuArbeideIPeriodenDuSokerFor === "ja")
    || (data.hvaSkalDuGjoreIPeriodenDuSokerFor === "jegSkalArbeide");`,
    `show = data.betalerDuSkattTilNorge === "nei" 
&& data.farDuInntektenDinFraEnNorskEllerUtenlandskVirksomhet.norskVirksomhet === true
&& data.hvilkenInntektHarDu.lonn === true;`,
    `show = data.farDuInntektenDinFraEnNorskEllerUtenlandskVirksomhet.utenlandskVirksomhet === true
    && data.hvilkenInntektHarDu.lonn === true;`,
    `show = (data.hvaSkalDuGjoreIPeriodenDuSokerFor === "jegSkalIkkeArbeide")
    || (data.hvaSkalDuGjoreIPerioden === "jegSkalArbeideIEttAnnetEosLandEllerSveits")
    || (data.hvaSkalDuGjoreIPerioden === "jegSkalArbeidePaFlySkipEllerSokkel")
    || (data.hvaSkalDuGjoreIPerioden === "jegSkalArbeideSomAuPairEllerPraktikant");`,
    `show = (data.hvaErDinRolle === "jegHarFullmakt") ||
       (data.hvaErDinRolle === "jegRepresentererEnVirksomhetMedFullmakt");`,
    `show = ((_.some(data.oppgiAlleVirksomheterDuArbeiderForINorge, (row) => { 

return row.erDenneVirksomhetenNorskEllerUtenlandsk === "utenlandskVirksomhet"; 

}))
    &&
    (_.some(data.oppgiAlleVirksomheterDuArbeiderForINorge, (row) => { 

return row.hvaErDinArbeidssituasjon === "arbeidstaker"; 

})))
    ||
       (data.hvaSkalDuGjoreIPerioden === "jegSkalArbeideSomAuPairEllerPraktikant");`,
    `show = 
data.harArbeidsgiverenSendtDegTilUtlandet === "ja" ||
data.erDuSendtUtAvArbeidsgiverenDin === "ja" ||
(data.hvaJobberDuSomIDenneVirksomheten5 === "arbeidstakerEllerFrilanser" &&
 data.erDetteLandetDuVanligvisJobberOffshoreI === "nei") ||
(data.hvaJobberDuSomIDenneVirksomheten6 === "arbeidstakerEllerFrilanser" && 
 data.erDetteSkipetDuArbeiderPaTilVanlig === "nei") ||
(data.hvaJobberDuSomIDenneVirksomheten7 === "arbeidstakerEllerFrilanser" &&
 data.erDetteHjemmebasenDuArbeiderFraTilVanlig === "nei");`,
    `show = (data.fastArbeidssted.avtaltHjemmekontorNorskVirksomhet === "ja") ||
       (data.paEnAnnenAdresse.avtaltHjemmekontorUtenlanskVirksomhetAnnen === "ja") ||
       (data.fastArbeidsstedNrEn.avtaltHjemmekontoretIUtlandetNorskVirksomhet === "ja") ||
       (data.paEnAnnenAdresseNrEn.avtaltHjemmekontoretIUtlandetMedArbeidsgiverenDin === "ja");`,
  ],
  nav031605: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav040103: [
    `show = (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "arbeidsgiverHarSagtMegOpp") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "kontraktenErUtgatt") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "jegHarSagtOppSelv") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "arbeidsgiverErKonkurs") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "jegErAvskjediget");`,
    `show = (data.tarDuUtdanningEllerOpplaering === "neiJegErIkkeUnderUtdanningEllerOpplaeringOgHarIkkeVaertDetDeSisteSeksManedene") ||
       (data.tarDuUtdanningEllerOpplaering === "neiMenJegHarAvsluttetUtdanningEllerOpplaeringILopetAvDeSisteSeksManedene");`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.annenSituasjon === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.omsorgForBarnUnderEttAr === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnTilOgMed7Klasse === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.harFylt60Ar === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.omsorgForBarnUnderEttAr === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnTilOgMed7Klasse === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.harFylt60Ar === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.denAndreForelderenJobberUtenforNaeromradet === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.annenSituasjon === true);`,
    `show = (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.stonadUnderArbeidsloshetFraGarantikassenForFiskereGff === true) ||
       (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.garantilottFraGarantikassenForFiskere === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kanDuTaAlleTyperArbeid === "nei");`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.eneansvarForBarnUnder18ArMedSpesielleBehov === true);`,
    `show = (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "arbeidsgiverHarSagtMegOpp") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "jegHarSagtOppSelv");`,
    `show = (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon1 === "jaJegArbeidetRotasjon") ||
       (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon2 === "jaJegArbeidetRotasjon") ||
       (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon3 === "jaJegArbeidetRotasjon") ||
       (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon4 === "jaJegArbeidetRotasjon");`,
  ],
  nav040104: [
    `show = (data.tarDuUtdanningEllerOpplaering === "nei") ||
       (data.tarDuUtdanningEllerOpplaering === "neiMenJegHarAvsluttetUtdanningEllerOpplaeringILopetAvDeSisteSeksManedene");`,
    `show = (data.velgSituasjonenSomGjelderDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.velgSituasjonenSomGjelderDeg.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg.denAndreForelderenJobberSkiftTurnusEllerUtenforNaeromradetOgDereHarAnsvarForBarnTilOgMed7KlasseEllerBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg.annenSituasjon === true);`,
    `show = (data.velgSituasjonenSomGjelderDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.velgSituasjonenSomGjelderDeg.omsorgForBarnUnderEttAr === true) ||
       (data.velgSituasjonenSomGjelderDeg.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnTilOgMed7Klasse === true) ||
       (data.velgSituasjonenSomGjelderDeg.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg.denAndreForelderenJobberSkiftTurnusEllerUtenforNaeromradetOgDereHarAnsvarForBarnTilOgMed7KlasseEllerBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg.harFylt60Ar === true);`,
    `show = (data.velgSituasjonenSomGjelderDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.velgSituasjonenSomGjelderDeg.omsorgForBarnUnderEttAr === true) ||
       (data.velgSituasjonenSomGjelderDeg.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnTilOgMed7Klasse === true) ||
       (data.velgSituasjonenSomGjelderDeg.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg.denAndreForelderenJobberSkiftTurnusEllerUtenforNaeromradetOgDereHarAnsvarForBarnTilOgMed7KlasseEllerBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg.harFylt60Ar === true);`,
    `show = (data.velgSituasjonenSomGjelderDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.velgSituasjonenSomGjelderDeg1.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg1.denAndreForelderenJobberSkiftTurnusEllerUtenforNaeromradetOgDereHarAnsvarForBarnTilOgMed7KlasseEllerBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg1.annenSituasjon === true);`,
    `show = (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.stonadUnderArbeidsloshetFraGarantikassenForFiskereGff === true) ||
       (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.garantilottFraGarantikassenForFiskere === true);`,
    `show = (data.velgSituasjonenSomGjelderDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.velgSituasjonenSomGjelderDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kanDuTaAlleTyperArbeid === "nei");`,
    `show = (data.velgSituasjonenSomGjelderDeg.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.velgSituasjonenSomGjelderDeg1.eneansvarEllerDeltAnsvarMedEnAnnenForelderSomDuIkkeBorSammenMedForBarnUnder18ArMedSpesielleBehov === true);`,
    `show = (data.tarDuUtdanningEllerOpplaering === "ja") ||
       (data.tarDuUtdanningEllerOpplaering === "neiMenJegHarAvsluttetUtdanningEllerOpplaeringILopetAvDeSisteSeksManedene");`,
  ],
  nav040203: [
    `show = (data.hvaErArsakenTilAtArbeidstakerIkkeJobberHosArbeidsgiverLenger === "arbeidstakerErOppsagt") ||
       (data.hvaErArsakenTilAtArbeidstakerIkkeJobberHosArbeidsgiverLenger === "arbeidstakerHarSagtOppSelv");`,
    `show = (data.hvaErArsakenTilAtArbeidstakerIkkeJobberHosArbeidsgiverLenger === "arbeidstakerErOppsagt") ||
       (data.hvaErArsakenTilAtArbeidstakerIkkeJobberHosArbeidsgiverLenger === "arbeidstakerErAvskjediget") ||
       (data.hvaErArsakenTilAtArbeidstakerIkkeJobberHosArbeidsgiverLenger === "arbeidstakerHarSagtOppSelv");`,
    `show = (data.harArbeidstakerFeriepengerTilUtbetaling === "jaDeErUtbetalt") ||
       (data.harArbeidstakerFeriepengerTilUtbetaling === "jaDeUtbetalesNa");`,
  ],
  nav040205: [
    `show = (row.oppgiSluttarsak==="oppsagt") || (row.oppgiSluttarsak==="saOppSelv") ||
(row.oppgiSluttarsak==="avskjediget") || (row.oppgiSluttarsak==="overtallighet");`,
    `show=
(row.harDuArbeidetRotasjon === "ja") || (row.harDuArbeidetRotasjon === "11Avtale");`,
    `show = _.some(data.ansettelser, (rad) => {return rad.arbeidsgiver !== ""});`,
    `var nD = new Date(2014, 11, 31);
var startday = new Date(data.hvilkenPeriodeSokerDuPdU1For.fraDatoDdMmAaaa);

show= (startday<= nD);`,
    `show = _.some(data.ansettelser, (rad) => {
  return rad.arbeidsgiver !== "";
});`,
    `show = _.some(data.ansettelser, (rad) => {
  return rad.oppgiSluttarsak === "oppsagt";
});`,
    `show = _.some(data.ansettelser, (rad) => {
  return rad.bleDetInngattSluttavtale === "ja";
});`,
    `show = _.some(data.ansettelser, (rad) => {
  return rad.harDuHattFastArbeidstid === "nei";
});`,
    `show=
(data.gikkBedriftenKonkurs === "ja") ||
_.some(data.ansettelser, (rad) => {return rad.gikkBedriftenKonkurs === "ja";});`,
  ],
  nav040307: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav040605: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `//show = moment(data.fraDatoDdMmAaaa5).add(moment(365), "d").isBefore(data.tilDatoDdMmAaaa5);
/*
isBefore
isAfter
isSameOrBefore
isSameOrAfter
*/`,
    `show = ((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei'));`,
    `show = ((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei'));`,
    `show = !(((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei')));`,
    `show = !(((data.velgUtdanning === 'grunnskole') && (data.harDuTidligereFullfortGrunnskolen === 'nei')) || ((data.velgUtdanning === 'videregaendeSkole') && (data.harDuTidligereFullfortOgBestattVideregaendeSkole === 'nei')));`,
  ],
  nav040608: [
    `show=
(data.erVirksomhetenBasertPaProvisjon === "ja100") ||
(data.erVirksomhetenBasertPaProvisjon === "jaDelvis");`,
    `show=
(data.angiStatusForSoknaden === "soknadenErInnvilget") ||
(data.angiStatusForSoknaden === "soknadenErAvslatt") ||
(data.harDuSoktSkalDuSokeAnnenFormForOkonomiskStotteTilEtableringen === "ja");`,
  ],
  nav040803: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErHeltOppsagtAvArbeidsgiver") ||
       (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarSagtOppStillingen") ||
       (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErAvskjediget");`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarVaertEkstrahjelpTilkallingsvikarOgHarFattRedusertArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "midlertidigArbeidsforholdErAvsluttetHarNaddSluttdato");
show=!hide;`,
    `show = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErHeltOppsagtAvArbeidsgiver") ||
       (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErDelvisOppsagtAvArbeidsgiver") ||
       (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErAvskjediget");`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarVaertEkstrahjelpTilkallingsvikarOgHarFattRedusertArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "midlertidigArbeidsforholdErAvsluttetHarNaddSluttdato");
show = !hide;`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarVaertEkstrahjelpTilkallingsvikarOgHarFattRedusertArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden");
show = !hide;`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarVaertEkstrahjelpTilkallingsvikarOgHarFattRedusertArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "midlertidigArbeidsforholdErAvsluttetHarNaddSluttdato") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErAvskjediget");
show = !hide;`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErAvskjediget") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden");
show = !hide;`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarVaertEkstrahjelpTilkallingsvikarOgHarFattRedusertArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden");
show = !hide;`,
    `var hide = (data.hvaErArbeidstakersSituasjon === "arbeidstakerenHarVaertEkstrahjelpTilkallingsvikarOgHarFattRedusertArbeidstiden") ||
           (data.hvaErArbeidstakersSituasjon === "arbeidstakerenErFortsattAnsattUtenEndringAvArbeidstiden");
show = !hide;`,
    `show = (data.hvordanHarArbeidstakersArbeidstidVaert.arbeidstakerHarHattVarierendeArbeidstidEllerIkkeHattFastArbeidstidIMinstSeksManederForArbeidstidenSistBleRedusert === true) ||
       (data.hvordanHarArbeidstakersArbeidstidVaert.arbeidstakerOnskerAtNavVurdererDenGjennomsnittligeArbeidstidenDeSiste36ManedeneForArbeidstidenSistBleRedusert === true);`,
    `show = (data.jegVilLeggeVedDetteIEtEgetVedleggIstedenforAFylleUtTabellenNedenfor === true) ||
       (data.jegVilLeggeVedDetteIEtEgetVedleggIstedenforAFylleUtTabellenNedenfor1 === true);`,
  ],
  nav040804: [
    `show = (row.hvordanHarArbeidstakersArbeidstidVaert.arbeidstakerHarHattFastArbeidstidIMinstSeksManederForArbeidstidenSistBleRedusert === true)
;`,
    `show = (row.hvaVarArbeidstakersArbeidstidsordning.fastUkentligArbeidstid === true) || 
	(row.hvaVarArbeidstakersArbeidstidsordning.varierendeArbeidstid === true)
;`,
    `show = (data.hvordanHarArbeidstakersArbeidstidVaert.arbeidstakerHarHattVarierendeArbeidstidEllerIkkeHattFastArbeidstidIMinstSeksManederForArbeidstidenSistBleRedusert === true) ||
       (data.hvordanHarArbeidstakersArbeidstidVaert.arbeidstakerOnskerAtNavVurdererDenGjennomsnittligeArbeidstidenDeSiste36ManedeneForArbeidstidenSistBleRedusert === true);`,
    `show = (data.jegVilLeggeVedDetteIEtEgetVedleggIstedenforAFylleUtTabellenNedenfor === true) ||
       (data.jegVilLeggeVedDetteIEtEgetVedleggIstedenforAFylleUtTabellenNedenfor1 === true);`,
  ],
  nav041603: [
    `show = (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "arbeidsgiverHarSagtMegOpp") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "kontraktenErUtgatt") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "jegHarSagtOppSelv") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "arbeidsgiverErKonkurs") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "jegErAvskjediget");`,
    `show = (data.hvemEierGardsbruket.jeg === true) ||
       (data.hvemEierGardsbruket.ektefelleSamboer === true) ||
       (data.hvemEierGardsbruket.andre === true);`,
    `show = (data.tarDuUtdanningEllerOpplaering === "neiJegErIkkeUnderUtdanningEllerOpplaeringOgHarIkkeVaertDetDeSisteSeksManedene") ||
       (data.tarDuUtdanningEllerOpplaering === "neiMenJegHarAvsluttetUtdanningEllerOpplaeringILopetAvDeSisteSeksManedene");`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.annenSituasjon === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.omsorgForBarnUnderEttAr === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnTilOgMed7Klasse === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.harFylt60Ar === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.omsorgForBarnUnderEttAr === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnTilOgMed7Klasse === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.harFylt60Ar === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.denAndreForelderenJobberUtenforNaeromradet === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.annenSituasjon === true);`,
    `show = (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.stonadUnderArbeidsloshetFraGarantikassenForFiskereGff === true) ||
       (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.garantilottFraGarantikassenForFiskere === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kanDuTaAlleTyperArbeid === "nei");`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.eneansvarForBarnUnder18ArMedSpesielleBehov === true);`,
    `show = (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "arbeidsgiverHarSagtMegOpp") ||
       (data.arbeidsforhold1.hvaErArsakenTilEndringenIArbeidsforholdetDitt === "jegHarSagtOppSelv");`,
    `show = (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon1 === "jaJegArbeidetRotasjon") ||
       (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon2 === "jaJegArbeidetRotasjon") ||
       (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon3 === "jaJegArbeidetRotasjon") ||
       (data.arbeidsforhold1.arbeidetDuSkiftTurnusEllerRotasjon4 === "jaJegArbeidetRotasjon");`,
  ],
  nav041604: [
    `var hide = (data.velgDetAlternativetSomPasserBestForDeg === "jegHarIkkeVaertIJobb") || (data.harDuJobbetEllerHattEndringerIEttEllerFlereArbeidsforholdSidenSistDuFikkDagpenger === "nei"); 
show = !hide;`,
    `show = (data.hvemEierGardsbruket.jeg === true) ||
       (data.hvemEierGardsbruket.ektefelleSamboer === true) ||
       (data.hvemEierGardsbruket.andre === true);`,
    `show = (data.tarDuUtdanningEllerOpplaering === "neiJegErIkkeUnderUtdanningEllerOpplaeringOgHarIkkeVaertDetDeSisteSeksManedene") ||
       (data.tarDuUtdanningEllerOpplaering === "neiMenJegHarAvsluttetUtdanningEllerOpplaeringILopetAvDeSisteSeksManedene");`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.annenSituasjon === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.omsorgForBarnUnderEttAr === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnTilOgMed7Klasse === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.harFylt60Ar === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.omsorgForBarnUnderEttAr === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnTilOgMed7Klasse === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.denAndreForelderenJobberUtenforNaeromradetEllerSkiftTurnus === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg.harFylt60Ar === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.denAndreForelderenJobberUtenforNaeromradet === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.annenSituasjon === true);`,
    `show = (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.stonadUnderArbeidsloshetFraGarantikassenForFiskereGff === true) ||
       (data.mottarDuEllerHarDuSoktOmNoenAvDisseYtelsene.garantilottFraGarantikassenForFiskere === true);`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.redusertHelseFysiskEllerPsykisk === true) ||
       (data.kanDuTaAlleTyperArbeid === "nei");`,
    `show = (data.kryssAvForDetUnntaketSomGjelderForDeg.eneansvarForBarnUnder18ArMedSpesielleBehov === true) ||
       (data.kryssAvForDetUnntaketSomGjelderForDeg1.eneansvarForBarnUnder18ArMedSpesielleBehov === true);`,
    `show (data.tarDuUtdanningEllerOpplaering === "ja") ||
     (data.tarDuUtdanningEllerOpplaering === "neiMenJegHarAvsluttetUtdanningEllerOpplaeringILopetAvDeSisteSeksManedene");`,
  ],
  nav060304: [
    `show = ((data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar")) && instance.isSubmissionDigital();`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") &&
       (data.hvorforSokerPaVegneAvEnAnnenPerson === "sokerenKanIkkeUndertegneSoknadSelv");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `var hide = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
           (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv");
           show = !hide;`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.harIkkeNorskFodselsnummerEllerDNummer === true) &&
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar");`,
    `show = (data.harIkkeNorskFodselsnummerEllerDNummer === true)
    && 
      ((data.borSokerenINorge === "ja"));`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv")
    || (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar")
;`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (row.velgReisemate === "bil") ||
       (row.velgReisemate === "annet");`,
    `show = (row.velgReisemate === "bil") ||
       (row.velgReisemate === "annet");`,
    `show = (row.velgReisemate === "bil") ||
       (row.velgReisemate === "annet");`,
    `show = (data.harBarnetEnHyperkinetiskForstyrrelse === "ja") ||
       (data.harBarnetEnHyperkinetiskForstyrrelse === "jaAdhdOgAndreDiagnoserSomGirKlesslitasje");`,
    `show = (data.harBarnetEnHyperkinetiskForstyrrelse === "jaAdhdOgAndreDiagnoserSomGirKlesslitasje") ||
       (data.harBarnetEnHyperkinetiskForstyrrelse === "nei");`,
    `show = (data.harBarnetEnHyperkinetiskForstyrrelse === "jaAdhdOgAndreDiagnoserSomGirKlesslitasje") ||
       (data.harBarnetEnHyperkinetiskForstyrrelse === "nei");`,
    `show = (data.harBarnetEnHyperkinetiskForstyrrelse === "jaAdhdOgAndreDiagnoserSomGirKlesslitasje") ||
       (data.harBarnetEnHyperkinetiskForstyrrelse === "nei");`,
    `show = (data.harBarnetEnHyperkinetiskForstyrrelse === "jaAdhdOgAndreDiagnoserSomGirKlesslitasje") ||
       (data.harBarnetEnHyperkinetiskForstyrrelse === "nei");`,
    `show = (data.harBarnetEnHyperkinetiskForstyrrelse === "nei") ||
       (data.harBarnetEnHyperkinetiskForstyrrelse === "jaAdhdOgAndreDiagnoserSomGirKlesslitasje");`,
    `show = (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil.driftAvTekniskeHjelpemidler === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil.transportDriftAvEgenBil === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil.fordyretKosthold === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil.klesslitasje === true) ||
       
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil1.driftAvTekniskeHjelpemidler === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil1.transportDriftAvEgenBil === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil1.fordyretKosthold === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil1.klesslitasje === true) ||
       
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil2.driftAvTekniskeHjelpemidler === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil2.transportDriftAvEgenBil === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil2.fordyretKosthold === true) ||
       (data.harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil2.klesslitasje === true);`,
    `show = (data.harDuDokumentasjonAvEkstrautgifterTilDriftAvTekniskeHjelpemidlerDuSkalSendeInnTilOss === "ja") ||
       (data.harBarnetDokumentasjonAvEkstrautgifteneTilDriftAvTekniskeHjelpemidlerSomSkalSendesInnTilOss === "ja") ||
       (data.harPersonenDuSokerForDokumentasjonAvEkstrautgifteneTilDriftAvTekniskeHjelpemidlerSomSkalSendesInnTilOss === "ja");`,
    `show = (data.harDuDokumentasjonAvEkstrautgifteneTilDrosjeDuSkalSendeInnTilOss === "ja") ||
       (data.harBarnetDokumentasjonAvEkstrautgifteneTilDrosjeSomSkalSendesInnTilOss === "ja") ||
       (data.harPersonenDuSokerForDokumentasjonAvEkstrautgifteneTilDrosjeSomSkalSendesInnTilOss === "ja");`,
    `show = (data.harDuDokumentasjonAvEkstrautgifteneTilDriftAvBilDuSkalSendeInnTilOss === "ja") ||
       (data.harBarnetDokumentasjonAvEkstrautgifterTilDriftAvBilSomSkalSendesInnTilOss === "ja") ||
       (data.harPersonenDuSokerForDokumentasjonAvEkstrautgifteneTilDriftAvBilSomSkalSendesInnTilOss === "ja");`,
    `show = (data.harDuDokumentasjonAvEkstrautgifteneTilKlesslitasjeDuSkalSendeInnTilOss === "ja") ||
       (data.harBarnetDokumentasjonAvEkstrautgifteneTilKlesslitasjeSomSkalSendesInnTilOss === "ja") ||
       (data.harPersonenDuSokerForDokumentasjonAvEkstrautgifteneTilKlesslitasjeSomSkalSendesInnTilOss === "ja");`,
  ],
  nav060404: [
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = ((data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar")) && instance.isSubmissionDigital();`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") &&
       (data.hvorforSokerPaVegneAvEnAnnenPerson === "sokerenKanIkkeUndertegneSoknadSelv");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `var hide = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
           (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv");
           show = !hide;`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.harIkkeNorskFodselsnummerEllerDNummer === true) &&
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar");`,
    `show = (data.harIkkeNorskFodselsnummerEllerDNummer === true)
    && 
      ((data.borSokerenINorge === "ja"));`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv")
    || (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar")
;`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.hvemSokerDuFor === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
  ],
  nav060701: [
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv")
    || (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEnAnnenPersonOver18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.kryssAvForDetDuSkalSvarePa.driftAvTekniskeHjelpemidler === true) ||
       (data.kryssAvForDetPersonenSkalSvarePa.driftAvTekniskeHjelpemidler === true);`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv") &&
       (data.kryssAvForDetDuSkalSvarePa.transportDriftAvEgenBil === true);`,
    `show = (data.kryssAvForDetDuSkalSvarePa.transportDriftAvEgenBil === true) &&
       ((data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar"));`,
    `show = (data.kryssAvForDetDuSkalSvarePa.forerhundFraNav === true) ||
       (data.kryssAvForDetPersonenSkalSvarePa.forerhundFraNav === true);`,
    `show = (data.kryssAvForDetDuSkalSvarePa.servicehundFraNav === true) ||
       (data.kryssAvForDetPersonenSkalSvarePa.servicehundFraNav === true);`,
    `show = (data.kryssAvForDetDuSkalSvarePa.fordyretKosthold === true) ||
       (data.kryssAvForDetPersonenSkalSvarePa.fordyretKosthold === true);`,
    `show = (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvMegSelv") &&
       (data.kryssAvForDetDuSkalSvarePa.klesslitasje === true);`,
    `show = (data.kryssAvForDetDuSkalSvarePa.klesslitasje === true) &&
       ((data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar") ||
       (data.sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSokerPaVegneAvEgetBarnUnder18Ar"));`,
    `show = (data.kryssAvForDetDuSkalSvarePa.annet === true) ||
       (data.kryssAvForDetPersonenSkalSvarePa.annet === true);`,
    `show = (data.harNavBedtOmDokumentasjonPaTransportIBrevet === "ja") ||
       (data.harNavBedtOmDokumentasjonPaTransportIBrevet1 === "ja") ||
       (data.harNavBedtOmDokumentasjonPaTransportIBrevet2 === "ja");`,
    `show = (data.hvordanDekkerDuTransportbehovetDittIDag.drosje === true) ||
       (data.hvordanDekkerBarnetTransportbehovetSittIDag.drosje === true) ||
       (data.hvordanDekkerVedkommendeTransportbehovetSittIDag.drosje === true);`,
    `show = (data.harNavBedtOmDokumentasjonPaSlitasjePaKlaerSkoOgSengetoyIBrevet === "ja") ||
       (data.harNavBedtOmDokumentasjonPaSlitasjePaKlaerSkoOgSengetoyIBrevet1 === "ja") ||
       (data.harNavBedtOmDokumentasjonPaSlitasjePaKlaerSkoOgSengetoyIBrevet2 === "ja");`,
  ],
  nav060702: [
    `show = (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvEnAnnenPersonOver18Ar") ||
       (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvEgetBarnUnder18Ar") ||
       (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvEgetBarnUnder18Ar") ||
       (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvEgetBarnUnder18Ar") ||
       (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
    `show = (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvMegSelv")
    || (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvEnAnnenPersonOver18Ar")
;`,
    `show = (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvEgetBarnUnder18Ar") ||
       (data.svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson === "jegSvarerPaVegneAvFosterbarnBarnIBeredskapshjemUnder18Ar");`,
  ],
  nav070208: [
    `show =
	((data.avdodesAlder === "nyfodt") && (data.avdodesAlder))
	&& ((data.hvorSkjeddeDodsfallet === "iNordenUtenforNorge") && (data.hvorSkjeddeDodsfallet));`,
    `show =
	((data.avdodesAlder === "018Ar")
	|| (data.avdodesAlder === "over18Ar")) &&
	((data.hvorSkjeddeDodsfallet === "iNordenUtenforNorge")
	|| (data.hvorSkjeddeDodsfallet === "iUtlandetUtenforNorden"));`,
    `show =
	((data.hvorSkjeddeDodsfallet === "iNordenUtenforNorge")
	&& (data.varAvdodePaFerieEllerAnnetMidlertidigOppholdDaDodsfalletSkjedde === "nei")) ||
	(data.hvorSkjeddeDodsfallet === "iUtlandetUtenforNorden")
	;`,
    `show = (data.avdodesAlder === "018Ar")
  && (data.skjeddeDodsfalletPaGrunnAvYrkesskade === "nei");`,
    `show =
  (data.avdodesAlder === "018Ar")
  && (data.varAvdodeStudentMedStudielanFraLanekassen === "nei")
  ;`,
    `show = (data.avdodesAlder === "over18Ar")
  && (data.skjeddeDodsfalletPaGrunnAvYrkesskade === "nei");`,
    `show =
  (data.avdodesAlder === "over18Ar")
  && (data.varAvdode === "ingenAvDelene")
  ;`,
    `show=
(data.harAvdodesMorNorskFodselsnummerEllerDNummer === "ja") ||
(data.haddeAvdodeNorskFodselsnummerEllerDNummer === "ja");`,
    `show=
(data.harAvdodesMorNorskFodselsnummerEllerDNummer === "nei") ||
(data.haddeAvdodeNorskFodselsnummerEllerDNummer === "nei");`,
    `show=
(data.varAvdodesMorBosattINorgePaDodstidspunktet === "ja") ||
(data.varAvdodeBosattINorgePaDodstidspunktet === "ja");`,
    `show=
(data.varAvdodesMorBosattINorgePaDodstidspunktet === "nei") ||
(data.varAvdodeBosattINorgePaDodstidspunktet === "nei");`,
    `show =
(data.hvorSkjeddeDodsfallet === "iNorge") &&
(data.haddeAvdodeNorskFodselsnummerEllerDNummer === "nei")
;`,
    `show =

(data.varAvdodeBosattINorgePaDodstidspunktet === "ja");`,
    `show = 
(data.hvaGjelderSoknaden.stonadTilBaretransport === true) &&
(data.hvorSkjeddeDodsfallet !== "iNorge");`,
    `show = 
(data.hvaGjelderSoknaden.gravferdsstonad === true) &&
(data.hvorSkjeddeDodsfallet !== "iNorge");`,
    `show =
(data.varAvdodeBosattINorgePaDodstidspunktet === "nei") &&
(data.hvorSkjeddeDodsfallet === "iNorge") &&
(data.haddeAvdodeNorskFodselsnummerEllerDNummer === "nei");`,
    `show =
(data.hvaGjaldtTransporten.transportTilBarerom === true) ||
(data.hvaGjaldtTransporten.transportTilSeremonisted === true) ||
(data.hvaGjaldtTransporten.transportTilGravplass === true) ||
(data.hvaGjaldtTransporten.transportTilKrematorium === true);`,
    `show =
(data.angiSamletKjorelengde <20) &&
(data.angiSamletKjorelengde !== 0);`,
    `show =
(data.hvaGjaldtTransporten.transportTilObduksjon === true) ||
(data.hvaGjaldtTransporten.transportTilBarerom === true) ||
(data.hvaGjaldtTransporten.transportTilSeremonisted === true) ||
(data.hvaGjaldtTransporten.transportTilNaturligGravplass === true) ||
(data.hvaGjaldtTransporten.transportTilKrematorium === true);`,
    `show = (row.hvaGjaldtTransporten.transportTilObduksjon === true) || 
	(row.hvaGjaldtTransporten.transportTilBarerom === true) ||
	(row.hvaGjaldtTransporten.transportTilSeremonisted === true) ||
	(row.hvaGjaldtTransporten.transportTilKrematorium === true) ||
	(row.hvaGjaldtTransporten.transportTilGravplass === true)
;`,
    `show = (row.hvaGjaldtTransporten.transportTilObduksjon === true) || 
	(row.hvaGjaldtTransporten.transportTilBarerom === true) ||
	(row.hvaGjaldtTransporten.transportTilSeremonisted === true) ||
	(row.hvaGjaldtTransporten.transportTilKrematorium === true) ||
	(row.hvaGjaldtTransporten.transportTilGravplass === true)
;`,
    `show = (row.hvaGjaldtTransporten.transportTilObduksjon === true) || 
	(row.hvaGjaldtTransporten.transportTilBarerom === true) ||
	(row.hvaGjaldtTransporten.transportTilSeremonisted === true) ||
	(row.hvaGjaldtTransporten.transportTilKrematorium === true) ||
	(row.hvaGjaldtTransporten.transportTilGravplass === true)
;`,
    `show = (data.kryssAvForDetSomErAktuelt === "jegErPrivatperson")
	|| (data.kryssAvForDetSomErAktuelt === "jegErAnsattIKommunen")
	|| (data.kryssAvForDetSomErAktuelt === "jegErAdvokatOgRepresentererBoet")
;`,
    `show =
(data.hvaGjelderSoknaden.gravferdsstonad === true) &&
(data.avdodesAlder === "over18Ar");`,
    `show =
(data.angiAvdodesSivileStatus === "giftRegistrertPartner") ||
(data.angiAvdodesSivileStatus === "samboerOgDeHaddeFellesBarn") ||
(data.angiAvdodesSivileStatus === "samboerMedTidligereEktefelleRegistrertPartner") ||
(data.angiAvdodesSivileStatus === "annet");`,
    `show =
(data.angiAvdodesSivileStatus === "enslig") || 
((data.angiAvdodesSivileStatus === "annet") && (data.varAvdodeForsorgetAvEosBorgerBosattINorge === "nei"));`,
    `show =
((data.angiAvdodesSivileStatus === "giftRegistrertPartner") ||
(data.angiAvdodesSivileStatus === "samboerOgDeHaddeFellesBarn") ||
(data.angiAvdodesSivileStatus === "samboerMedTidligereEktefelleRegistrertPartner")) &&
(data.varAvdodeForsorgetAvEosBorgerBosattINorge === "nei");`,
    `show =
((data.angiAvdodesSivileStatus === "giftRegistrertPartner") || 
(data.angiAvdodesSivileStatus === "samboerOgDeHaddeFellesBarn") || 
(data.angiAvdodesSivileStatus === "samboerMedTidligereEktefelleRegistrertPartner"));`,
    `show =
(data.hvaGjelderSoknaden.gravferdsstonad === true) &&
(data.avdodesAlder === "over18Ar");`,
    `show =
(data.hvaGjelderSoknaden.gravferdsstonad === true) &&
(data.avdodesAlder === "over18Ar");`,
    `show =
(data.hvaGjelderSoknaden.gravferdsstonad === true) &&
(data.avdodesAlder === "over18Ar");`,
    `show =
(data.hvaGjelderSoknaden.stonadTilBaretransport === true) ||
(data.hvaGjelderSoknaden.gravferdsstonad === true);`,
    `show=
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAFaPengeneUtbetaltTilMittKontonummerSomErRegistrertHosNav") &&
(data.harDuNorskFodselsnummerDNummer !== "ja");`,
    `show=
(data.haddeAvdodeNorskFodselsnummerEllerDNummer === "nei") &&
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAtPengeneSkalUtbetalesTilAvdodesDodsboetsKontonummer");`,
    `show=
(data.harAvdodesMorNorskFodselsnummerEllerDNummer  === "nei") &&
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAtPengeneSkalUtbetalesTilAvdodesDodsboetsKontonummer");`,
    `show=
((data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAFaPengeneUtbetaltTilMittKontonummerSomErRegistrertHosNav") &&
(data.harDuNorskFodselsnummerDNummer === "ja"));`,
    `show=
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAtPengeneSkalUtbetalesTilAvdodesDodsboetsKontonummer") &&
(data.haddeAvdodeNorskFodselsnummerEllerDNummer === "ja");`,
    `show=
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAtPengeneSkalUtbetalesTilAvdodesDodsboetsKontonummer") &&
(data.harAvdodesMorNorskFodselsnummerEllerDNummer === "ja");`,
    `show=
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAtPengeneSkalUtbetalesTilNoenAndre") ||
(data.hvorOnskerDuStonadenUtbetalt1 === "jegOnskerAtPengeneSkalUtbetalesTilNoenAndre");`,
    `show=
(data.hvorOnskerDuStonadenUtbetalt === "jegOnskerAFaPengeneUtbetaltTilMittKontonummerMenJegHarIkkeNorskBankkonto") ||
(data.hvorOnskerDuStonadenUtbetalt1 === "jegOnskerAFaPengeneUtbetaltTilMittKontonummerMenJegHarIkkeNorskBankkonto");`,
    `show =
(data.hvaGjelderSoknaden.stonadTilBaretransport === true) ||
(data.hvaGjelderSoknaden.gravferdsstonad === true);`,
    `show =
((data.hvaGjelderSoknaden.gravferdsstonad === true) && (data.avdodesAlder != "nyfodt") &&
((data.hvorSkjeddeDodsfallet === "iNordenUtenforNorge") || (data.hvorSkjeddeDodsfallet === "iUtlandetUtenforNorden"))) ||
((data.hvaGjelderSoknaden.stonadTilBaretransport === true) && (data.avdodesAlder != "nyfodt") &&
((data.varAvdodeEosBorgerSomVarPaMidlertidigOppholdINorge === "ja") ||
((data.hvorSkjeddeDodsfallet === "iNordenUtenforNorge") && (data.varAvdodePaFerieEllerAnnetMidlertidigOppholdDaDodsfalletSkjedde === "ja")) ||
(data.hvorSkjeddeDodsfallet === "iUtlandetUtenforNorden")));`,
    `show =
  (data.hvaGjelderSoknaden.gravferdsstonad === true) &&
  (data.avdodesAlder === "over18Ar") &&
  (data.varAvdodeBosattINorgePaDodstidspunktet === "nei");`,
    `show =
  (data.hvaGjelderSoknaden.gravferdsstonad === true) &&
  (data.avdodesAlder === "over18Ar") &&
  (data.erAvdodesEktefelleSamboerBosattINorge === "nei");`,
    `show =
	((data.varAvdodeBarnAvEuEosBorgerSomVarBosattINorgeHaddeNorskArbeidsgiverEllerHaddeTrygdeytelser === "ja") ||
	(data.varAvdodeBarnAvEuEosBorgerSomVarBosattINorgeHaddeNorskArbeidsgiverEllerHaddeTrygdeytelserFraNorge1 === "ja")) ||
	(data.angiAvdodesSivileStatus === "samboerOgDeHaddeFellesBarn");`,
    `show =
	(data.erEktefelleRegistrertPartnerEllerSamboerMedFellesBarnTilAvdodeEntenEueosborgerBosattINorgeHarNorskArbeidsgiverEllerHarTrygdeytelserFraNorge === "ja") ||
	(data.angiAvdodesSivileStatus === "giftRegistrertPartner");`,
  ],
  nav080708: [
    `show=
(data.henvisning.pasientenErHenvistTil.utredning === true) ||
(data.henvisning.pasientenErHenvistTil.behandling === true);`,
  ],
  nav080906: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvaErDinYrkesstatus.arbeidstaker !== true)
    &&
      ((data.hvaErDinYrkesstatus.arbeidsledig === true)
    || (data.hvaErDinYrkesstatus.selvstendigNaeringsdrivende === true)
    || (data.hvaErDinYrkesstatus.jordsbrukerFiskerEllerReindriftsutover === true)
    || (data.hvaErDinYrkesstatus.selvstendigNaeringsdrivendeDagmamma === true)
    || (data.hvaErDinYrkesstatus.frilanser === true)
    || (data.hvaErDinYrkesstatus.annet === true));`,
    `show = (data.kunForArbeidstakere.hvorUtforerDuLonnetArbeid.utenforNorge === true)
    || (data.utforerDuLonnetArbeidUtenforNorge === "ja");`,
  ],
  nav080907: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav081401: [
    `show = _.some(data.transportmiddelIReisetilskuddsperioden, (rad) => {
  return rad.samletUtleggIPerioden > 0;
});`,
  ],
  nav082005: [
    `show = (data.harArbeidstagerNorskFodselsnummerEllerDNummer === "ja")
    && (data.erArbeidstakerIEtArbeidsforholdIDag === "ja");`,
    `show = (data.harArbeidstagerNorskFodselsnummerEllerDNummer === "ja")
    && (data.erArbeidstakerIEtArbeidsforholdIDag === "ja");`,
  ],
  nav083001: [
    `show = (data.hvaGjelderSoknaden === "sykepengerTilArbeidstaker")||
       (data.hvaGjelderSoknaden === "sykepengerTilSjomann");`,
  ],
  nav083501: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.harDuDokumentasjonDuOnskerALeggeVedSoknaden === "ja");`,
  ],
  nav083605: [
    `show = 
(data.harDuNorskFodselsnummerEllerDNummer !== "nei") &&
((data.angiTypeVirksomhet === "selvstendigNaeringsdrivende") ||
(data.angiTypeVirksomhet === "jordbrukerEllerReindriftsutover"))
;`,
    `show = 
(data.harDuNorskFodselsnummerEllerDNummer !== "nei") &&
((data.angiTypeVirksomhet === "selvstendigNaeringsdrivende") ||
(data.angiTypeVirksomhet === "jordbrukerEllerReindriftsutover"))
;`,
    `show = 
(data.harDuNorskFodselsnummerEllerDNummer !== "nei") &&
(data.angiTypeVirksomhet === "frilanser");`,
  ],
  nav083606: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100704: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100705: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100706: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100708: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvaSokerDuOm.horeapparat === true)
    || (data.hvaSokerDuOm.tinnitusmaskerer === true);`,
    `show = (data.hvaSokerDuOm.horeapparat !== true)
    && (data.hvaSokerDuOm.tinnitusmaskerer !== true)
    && (data.hvaSokerDuOm.tilleggsutstyr === true);`,
    `show = (((data.hvaSokerDuOm.horeapparat === true)
    || (data.hvaSokerDuOm.tinnitusmaskerer === true))
    && (data.hvaSokerDuOm.tilleggsutstyr === true))
    || (data.harSokerenFattStonadTilHoreapparatFraFolketrygdenEllerHarSokerenKjoptHoreapparatetPrivat === "sokerenHarFattStonadTilHoreapparatetFraFolketrygden");`,
    `show = (data.hvaSokerDuOm.horeapparat === true) || (data.hvaSokerDuOm.tinnitusmaskerer === true);`,
    `show = (data.erHoreapparatetEllerTinnitusmaskererenPaRammeavtale === "nei")
    || (data.gjelderSoknadenRiteLydgiverSoftbandTilBenforankretHoreapparatEllerPuteTilTinnitusmaskerer === "nei");`,
    `show = (data.hvaSokerDuOm.horeapparat === true)
    || (data.hvaSokerDuOm.tinnitusmaskerer === true)
    || (data.gjelderSoknadenRiteLydgiverSoftbandTilBenforankretHoreapparatEllerPuteTilTinnitusmaskerer === "nei");`,
  ],
  nav100710: [
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei");`,
    `show =
(row.hvilketHjelpemiddelSokesDetOm === "protese") && (row.antallAvDetteHjelpemidlet > 1);`,
    `show =
(row.hvilketHjelpemiddelSokesDetOm === "ortose") && (row.antallAvDetteHjelpemidlet > 1);`,
    `show =
(row.hvilketHjelpemiddelSokesDetOm === "spesialfottoy") && (row.antallAvDetteHjelpemidlet > 2);`,
    `show =
(row.hvilketHjelpemiddelSokesDetOm === "aktivitetshjelpemidlerForBrukereOver26Ar") && (row.antallAvDetteHjelpemidlet > 1);`,
    `show = 
(row.antallAvDetteHjelpemidlet > 1) && (row.velgAktuellFotseng === "par");`,
    `show = 
(row.antallAvDetteHjelpemidlet > 1) && (row.velgAktuellFotseng === "tilEnFot");`,
    `show = 
(row.antallAvDetteHjelpemidlet > 2) && (row.hvilketHjelpemiddelSokesDetOm === "ortopediskSyddFottoy");`,
    `show = 
(row.antallAvDetteHjelpemidlet > 2) && (row.spesifikasjonAvEndringAvFottoy === "oppbyggingAvFottoyPar");`,
    `show = 
(row.antallAvDetteHjelpemidlet > 2) && (row.spesifikasjonAvEndringAvFottoy === "ombyggingAvFottoyPar");`,
    `show = 
(row.antallAvDetteHjelpemidlet > 1) && (row.hvilketHjelpemiddelSokesDetOm === "annet");`,
    `show=
(data.angiDinRolleISoknadsprosessen === "jegErLege") &&
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei");`,
    `show = 
_.some(data.hjelpemiddel, (rad) => {  return (rad.hvilketHjelpemiddelSokesDetOm === "fotseng");});`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei");`,
    `show=
(data.hvaGjelderSoknaden === "forsteGangsSoknadOmOrtopediskHjelpemiddel") ||
(data.angiDinRolleISoknadsprosessen === "jegErLege");`,
    `show=
(data.angiDinRolleISoknadsprosessen === "jegErOrtopediingenior");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei");`,
    `show=
_.some(data.hjelpemiddel, (rad) => {  return (rad.erDenneSoknadenSendtInnenforDetTidsrommet5Eller10ArEnLegespesialistHarAngittAtDetKanSokesUtenNyLegeerklaering === "nei") ;});`,
  ],
  nav100714: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.detSokesOmStonadTil === "kontaktlinser") ||
(data.detSokesOmStonadTil === "brillerOgKontaktlinser");`,
    `show = Number(data.cylH < 0);`,
    `show = Number(data.cylV < 0);`,
    `show=false`,
    `show = false`,
    `show = (data.ordinareVilkaar.kriterieneForASokePaOrdinaereVilkarErOppfylt === "nei") || 
(data.varSoker10ArEllerEldre === "ja");`,
    `show = (data.vilkarsutregning.sats1 === true) && (data.vilkarsutregning.sats2 === false) && (data.vilkarsutregning.individueltBelop === false);`,
    `show = (data.vilkarsutregning.sats2 === true) && (data.vilkarsutregning.individueltBelop === false);`,
    `show = (data.detSokesOmStonadTil === "kontaktlinser") || 
(data.detSokesOmStonadTil === "brillerOgKontaktlinser");`,
    `show= data.detSokesOmStonadTil === 'briller' && data.vilkarsutregning.individueltBelop === true;`,
  ],
  nav100715: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100716: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bat === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.fly === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.tog === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bil === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bil === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.drosje === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.annetTransportmiddel === true); 
}));`,
    `show=
data.harDuHattMedLedsagerPaReisen === "ja";`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.harDuBenyttetBilferge === "ja"); 
}))
||
(_.some(data.transportmiddelRetur, (row) => {  
return (row.harDuBenyttetBilferge === "ja"); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true) ||
       (row.transportmiddel.bat === true) ||
       (row.transportmiddel.fly === true) ||
       (row.transportmiddel.tog === true) ||
       (row.transportmiddel.drosje === true) ||
       (row.transportmiddel.annetTransportmiddel === true); 
}))
||
(_.some(data.transportmiddelRetur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true) ||
       (row.transportmiddel.bat === true) ||
       (row.transportmiddel.fly === true) ||
       (row.transportmiddel.tog === true) ||
       (row.transportmiddel.drosje === true) ||
       (row.transportmiddel.annetTransportmiddel === true); 
}));`,
  ],
  nav100717: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bat === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.fly === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.tog === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.drosje === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.annetTransportmiddel === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.harDuBenyttetBilferge === "ja"); 
}))
||
(_.some(data.transportmiddelRetur, (row) => {  
return (row.harDuBenyttetBilferge === "ja"); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true) ||
       (row.transportmiddel.bat === true) ||
       (row.transportmiddel.fly === true) ||
       (row.transportmiddel.tog === true) ||
       (row.transportmiddel.drosje === true) ||
       (row.transportmiddel.annetTransportmiddel === true); 
}))
||
(_.some(data.transportmiddelRetur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true) ||
       (row.transportmiddel.bat === true) ||
       (row.transportmiddel.fly === true) ||
       (row.transportmiddel.tog === true) ||
       (row.transportmiddel.drosje === true) ||
       (row.transportmiddel.annetTransportmiddel === true); 
}));`,
  ],
  nav100718: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvordanOnskerDuAFylleUtSoknaden === "viaDetteSkjemaet") &&
       (data.hvemSkalDeltaPaTilpasningskurset.parorende === true);`,
  ],
  nav100719: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bat === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.fly === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.tog === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.drosje === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.annetTransportmiddel === true); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.harDuBenyttetBilferge === "ja"); 
}))
||
(_.some(data.transportmiddelRetur, (row) => {  
return (row.harDuBenyttetBilferge === "ja"); 
}));`,
    `show = (_.some(data.transportmiddelTur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true) ||
       (row.transportmiddel.bat === true) ||
       (row.transportmiddel.fly === true) ||
       (row.transportmiddel.tog === true) ||
       (row.transportmiddel.drosje === true) ||
       (row.transportmiddel.annetTransportmiddel === true); 
}))
||
(_.some(data.transportmiddelRetur, (row) => {  
return (row.transportmiddel.bussTrikkTBane === true) ||
       (row.transportmiddel.bat === true) ||
       (row.transportmiddel.fly === true) ||
       (row.transportmiddel.tog === true) ||
       (row.transportmiddel.drosje === true) ||
       (row.transportmiddel.annetTransportmiddel === true); 
}));`,
  ],
  nav100723: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100725: [
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForEtBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnElevSomJegErVergeFor");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegErAnsattPaSkoleOgSokerForEnElev");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegErAnsattPaSkoleOgSokerForEnElev");`,
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForEtBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnElevSomJegErVergeFor") ||
       (data.hvemFyllerUtSoknaden === "jegErAnsattPaSkoleOgSokerForEnElev");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegErAnsattPaSkoleOgSokerForEnElev");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegErAnsattPaSkoleOgSokerForEnElev");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEtBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnElevSomJegErVergeFor") ||
       (data.harDenSomFyllerUtSoknadenOppfolgingsOgOpplaeringsansvaret === "nei");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegErAnsattPaSkoleOgSokerForEnElev") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnElevSomJegErVergeFor");`,
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForEtBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnElevSomJegErVergeFor");`,
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForEtBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnElevSomJegErVergeFor");`,
  ],
  nav100726: [
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonJegErVergeFor");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnInnbygger") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonJegErVergeFor");`,
    `show = (data.hvemSkalTilskuddetUtbetalesTil === "foreldreEllerForesatte") ||
       (data.hvemSkalTilskuddetUtbetalesTil === "verge");`,
    `show = (data.hvemFyllerUtSoknaden === "jegFyllerUtPaVegneAvMegSelv") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonJegErVergeFor");`,
  ],
  nav100727: [
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForEnInnbygger") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.hvemSkalTilskuddetUtbetalesTil === "foreldreEllerForesatte") ||
       (data.hvemSkalTilskuddetUtbetalesTil === "verge");`,
    `show = (data.hvemFyllerUtSoknaden === "jegFyllerUtPaVegneAvMegSelv") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForBarnUnder18ArSomJegHarOmsorgFor") ||
       (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
  ],
  nav100730: [
    `show = (data.harDuNorskFodselsnummerEllerDNummer === "nei") && (data.borDuINorge === "ja");`,
    `show = (data.harDuNorskFodselsnummerEllerDNummer === "nei") && (data.borDuINorge === "nei");`,
    `show=
(data.harDuBehovForLeseOgSekretaerhjelpTilUtdanningOpplaeringEllerArbeidstrening === "ja") ||
(data.harDuBehovForLeseOgSekretaerhjelpIDittArbeid === "ja") ||
(data.harDuBehovForLeseOgSekretaerhjelpForAUtforeVervIOrganisasjonerPolitiskOgEllerSosialtArbeid === "ja");`,
  ],
  nav100734: [`show = data.inngaarBrillenIAbonnement == 'vetIkke' || data.inngaarBrillenIAbonnement == 'nei';`],
  nav100736: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvilketOyeGjelderDet === "hoyre") ||
       (data.hvilketOyeGjelderDet === "begge");`,
    `show = (data.hvilketOyeGjelderDet === "venstre") ||
       (data.hvilketOyeGjelderDet === "begge");`,
    `show = (data.hvilketOyeGjelderDet === "hoyre") ||
       (data.hvilketOyeGjelderDet === "begge");`,
    `show = (data.hvilketOyeGjelderDet === "venstre") ||
       (data.hvilketOyeGjelderDet === "begge");`,
  ],
  nav100740: [
    `show = (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil")
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialutstyrEllerTilpasningAvBil");`,
    `show = (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil") || (data.hvaSkalDuSokeOm === "stonadTilSpesialutstyrEllerTilpasningAvBil");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning")
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil")
    || (data.sokerDuOmKjoretekniskUtstyr === "nei");`,
    `show = (data.sokerDuOmKjoretekniskUtstyr === "ja")
    || (data.hvemSkalKjoreBilen === "jegSkalKjoreSelv");`,
    `show = (data.hvaSkalDuSokeOm !== "stonadTilSpesialutstyrEllerTilpasningAvBil")
    && (data.holderDuPaATaEllerSkalDuBegynneATaForerkort === "ja");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning") 
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil") 
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialutstyrEllerTilpasningAvBil");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning")
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil")
    || (data.sokerDuOmKjoretekniskUtstyr === "ja");`,
    `show = (data.harDuBehovForSpesialtilpasning === "ja")
    || (data.hvorforSokerDuOmSpesialtilpassetKassebil.paGrunnAvFysiskFunksjonsnedsettelse === true)
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialutstyrEllerTilpasningAvBil");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning")
    || ((data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil")
    && (row.hvaSkalDuBrukeBilenTil === "kjoringTilOgFraArbeidEllerUtdanningssted"));`,
    `show = 
 (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.erDuUnder18Ar === 'ja') && (data.harDuVerge === 'nei');`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning") || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil");`,
    `show = (data.hvaSkalDuBrukeBilenTil === "kjoringTilOgFraArbeidEllerUtdanningssted") || (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning");`,
    `show = (data.harDuSaStortTransportbehovTilOgFraArbeidEllerUtdanningsstedAtDuTrengerEgenBil === 'nei') || (data.harDuSaStortTransportbehovIDagliglivetAtDuTrengerEgenBil === 'nei');`,
    `show = (data.harDuSaStortTransportbehovTilOgFraArbeidEllerUtdanningsstedAtDuTrengerEgenBil === 'ja') || (data.harDuSaStortTransportbehovIDagliglivetAtDuTrengerEgenBil === 'ja');`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning") || (data.hvaSkalDuBrukeBilenTil === "kjoringTilOgFraArbeidEllerUtdanningssted");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning") || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning") || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil");`,
    `show = (data.eierDuBil === "ja") && (data.hvaSkalDuBrukeBilenTil === "kjoringTilOgFraArbeidEllerUtdanningssted");`,
    `show = (data.eierDuBil === "ja") && (data.hvaSkalDuBrukeBilenTil === "iDagliglivet");`,
    `show = (data.hvilkenTypeBilHarDuDagliglivet === "personbil") && (data.kanDuBrukeBilenDin === "ja");`,
    `show = (data.hvilkenTypeBilHarDu === "personbil") && (data.kanDuBrukeBilenDin === "ja");`,
    `show = (data.hvilkenTypeBilHarDuDagliglivet === "spesialtilpassetKassebilSomErNyereEnn11Ar") && (data.kanDuBrukeBilenDin === "ja");`,
    `show = (data['eierDuBil'] === 'nei') || (data['eierDuBil1'] === 'nei');`,
    `show = (data.eierDuBil === "ja")
    || (data.erDetAndreIHusstandenDinSomEierBilIDag === "ja");`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning")
    || (data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil")
    || (data.sokerDuOmKjoretekniskUtstyr === "ja");`,
    `show = (data.harDuBehovForSpesialtilpasning === "ja") ||
       (data.hvaSkalDuSokeOm === "stonadTilSpesialutstyrEllerTilpasningAvBil") ||
       (data.hvorforSokerDuOmSpesialtilpassetKassebil.paGrunnAvFysiskFunksjonsnedsettelse === true);`,
    `show = (data.hvaSkalDuSokeOm === "tilskuddTilKjopAvBilTilBrukTilOgFraArbeidEllerHoyereUtdanning")
    || ((data.hvaSkalDuSokeOm === "stonadTilSpesialtilpassetKassebil")
    && (row.hvaSkalDuBrukeBilenTil === "kjoringTilOgFraArbeidEllerUtdanningssted"));`,
  ],
  nav100750: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100753: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100754: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100755: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (row.hvaSokerDuOm.stonadTilAFaLagetGrunnmonsterForsteGang === true) || 
	(row.hvaSokerDuOm.endringAvGrunnmonsterFordiDinKroppsfasongHarForandretSegVesentlig === true)
;`,
    `show = (row.hvorforTrengerDuGrunnmonster === "jegErKortvokstOgTrengerSpesialsyddeKlaer") || 
	(row.hvorforTrengerDuGrunnmonster === "jegErKortvokstOgTrengerSpesialsyddBukse") ||
	(row.hvorforTrengerDuGrunnmonster === "kroppenMinHarUlikHoyreOgVenstreSide") ||
	(row.hvorforTrengerDuGrunnmonster === "jegHarKrumRyggPukkelrygg") ||
	(row.hvorforTrengerDuGrunnmonster === "jegHarEnAvvikendeKroppsformSomIkkeDekkesAvPunkteneOver")
;`,
  ],
  nav100757: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "standardparykkerAvEkteHar") ||
(data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "individueltTillagedeParykkerAvEkteEllerSyntetiskHar");`,
    `show = (data.container.typeParykk === "jegKanBrukeEnStandardparykk")
    || (data.container.typeParykk === "jegTrengerEnSkreddersyddParykkPaGrunnAvHodeformenOgSokerDerforOmUtvidetStonad")
    || (data.container.typeParykk === "jegErAllergiskMotSyntetiskMaterialeOgSokerDerforOmUtvidetStonadTilParykkAvEkteHar")
    || (data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "syntetiskeStandardparykker")
    || (data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "individueltTillagedeParykkerAvEkteEllerSyntetiskHar")
    || (data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "standardparykkerAvEkteHar");`,
    `show = (data.container.typeParykk === "jegKanBrukeEnStandardparykk")
    || (data.container.typeParykk === "jegTrengerEnSkreddersyddParykkPaGrunnAvHodeformenOgSokerDerforOmUtvidetStonad")
    || (data.container.typeParykk === "jegErAllergiskMotSyntetiskMaterialeOgSokerDerforOmUtvidetStonadTilParykkAvEkteHar")
    || (data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "syntetiskeStandardparykker")
    || (data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "individueltTillagedeParykkerAvEkteEllerSyntetiskHar")
    || (data.opplysningerTilSoknadenHvisSokerErUnder30Ar.hvaSlagsParykkHarDuKjoptEllerSkalDuKjope === "standardparykkerAvEkteHar");`,
    `show =
(data.sokerDuOmParykkFordiDuHarKjonnsinkongruens === "nei") &&
((data.erDetForsteGangDuSokerOmStonadTilParykkEllerHodeplagg === "ja") || (data.erDetMerEnn3ArSidenDuSistFikkStonadTilParykkEllerHodeplagg === "ja"));`,
    `show =
(data.sokerDuOmParykkFordiDuHarKjonnsinkongruens === "ja") &&
(data.erDetForsteGangDuSokerOmStonadTilParykkEllerHodeplagg === "ja");`,
  ],
  nav100758: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.oyeprotese.jegSokerOmReserveeksemplarAvOyeprotese);`,
    `show=
(data.oyeprotese.dokumentasjonReserveeksemplar.jegBegrunnerHvorforDetErNodvendigMedReserveeksemplar === true);`,
    `show=
(data.oyeprotese.dokumentasjonReserveeksemplar.jegLeggerVedDokumentasjonFraLeverandorSomBegrunnerBehovetForReserveeksemplar === true);`,
  ],
  nav100759: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.spesialbrystholder.erDetForsteGangDuSokerOmStonadTilSpesialbrystholder === "nei") &&
(data.hvaErArsakenTilAtDuTrengerBrystproteseEllerSpesialbrystholder !== "kjonnsinkongruens");`,
    `show=
(data.spesialbrystholder.erDetForsteGangDuSokerOmStonadTilSpesialbrystholder === "ja") &&
(data.hvaErArsakenTilAtDuTrengerBrystproteseEllerSpesialbrystholder !== "kjonnsinkongruens");`,
    `show=
((data.spesialbrystholder.erDetForsteGangDuSokerOmStonadTilSpesialbrystholder === "ja") || (data.brystprotese.erDetForsteGangDuSokerOmStonadTilBrystprotese === "ja")) && 
(data.hvaErArsakenTilAtDuTrengerBrystproteseEllerSpesialbrystholder === "kjonnsinkongruens");`,
    `show=
(data.brystprotese.erDetForsteGangDuSokerOmStonadTilBrystprotese === "ja") && 
(data.hvaErArsakenTilAtDuTrengerBrystproteseEllerSpesialbrystholder !== "kjonnsinkongruens");`,
  ],
  nav100760: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.oppgiAntallEkstraParSkoSomDuSokerStonadFor >2);`,
  ],
  nav100761: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav100763: [
    `show = (data.harDuNorskFodselsnummerEllerDNummer === "nei") && (data.borDuINorge === "ja");`,
    `show = (data.harDuNorskFodselsnummerEllerDNummer === "nei") && (data.borDuINorge === "nei");`,
  ],
  nav100780: [
    `show = (data.bekreftelsenGjelderUtlanOgTildelingAv.horeapparat === true) || (data.bekreftelsenGjelderUtlanOgTildelingAv.tinnitusmaskerer === true);`,
    `show = !!data.modellHoyreOre;`,
    `show = !!data.modellVenstreOre;`,
    `show = (data.bekreftelsenGjelderUtlanOgTildelingAv.horeapparat === true) || (data.bekreftelsenGjelderUtlanOgTildelingAv.tinnitusmaskerer === true);`,
    `show = (data.bekreftelsenGjelderUtlanOgTildelingAv.horeapparat === true) || (data.bekreftelsenGjelderUtlanOgTildelingAv.tinnitusmaskerer === true);`,
  ],
  nav100786: [
    `show = instance.isSubmissionDigital();`,
    `show = instance.isSubmissionDigital() && data.jegSokerPaVegneAvMegSelv === false;`,
    `show = !instance.isSubmissionDigital();`,
    `show = data.hvemFyllerUtSoknaden === 'jegFyllerUtSoknadenPaVegneAvMegSelv' || data.jegSokerPaVegneAvMegSelv === true;`,
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.erDuOver18Ar === "ja")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForInnbygger")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.hvemSokerDuFor === "jegSokerPaVegneAvPersonOver18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForInnbygger")
&& (data.hvemSokerDuFor === "jegSokerPaVegneAvPersonUnder18Ar");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemFyllerUtSoknaden === "jegErFagpersonSomSokerForInnbygger")
&& (data.hvemSokerDuFor === "jegSokerPaVegneAvPersonUnder18Ar");`,
    `var hide = (data.erDuOver18Ar === "nei")
|| (data.hvemSokerDuFor === "jegSokerPaVegneAvPersonUnder18Ar")
|| (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
|| (data.erPersonenDuSokerForOver18Ar === "nei");
show = !hide;`,
    `show = (data.sokerDuOmProgramvareForLeseOgSkrivevansker === "nei")
|| (data.sokerDuOgsaOmAndreHjelpemidler === "ja");`,
    `show = (data.harDuTilleggsvansker.NeiJegHarIngenTilleggsvanskerSomErRelevantForDenneSoknaden === true)
   &&
      ((data.harDuTilleggsvansker.taleOgSprak === true)
   || (data.harDuTilleggsvansker.hukommelse === true)
   || (data.harDuTilleggsvansker.planleggingEllerOrganisering === true)
   || (data.harDuTilleggsvansker.laeringOgForstaelse === true)
   || (data.harDuTilleggsvansker.lesingOgSkriving === true)
   || (data.harDuTilleggsvansker.motorikkOgBevegelse === true)
   || (data.harDuTilleggsvansker.andreTilleggsvansker === true));`,
    `show = (row.sokerDuOmProgramvareForLeseOgSkrivevansker === "ja")
&&  (row.skalHjelpemidleneTilDinFolkeregistrerteAdresse === "nei");`,
    `show = (data.hvemFyllerUtSoknaden === "jegFyllerUtSoknadenPaVegneAvMegSelv")
|| (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
|| (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor") 
|| (data.jegSokerPaVegneAvMegSelv === true);`,
    `show = (data.sokerSelv1.harDuNoenSomKanHjelpeDegATaIBrukHjelpemiddeletOgFolgeOppBrukenAvDet1 === "ja")
    || (data.harBegrunnerAvSoknadenOppfolgingsOgOpplaeringsansvar === "nei")
    || (data.harDuSelvOppfolgingsOgOpplaeringsansvar === "nei");`,
    `show = (data.skalBarnetsForesatteSignereSoknadenEllerFullmaktsskjema === "fullmakt")
|| (data.skalSokerenSignereSoknadenEllerFullmaktsskjema === "sokerenSkalSignereFullmaktsskjema");`,
  ],
  nav100787: [
    `show = 
 (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.hvemFyllerUtSoknaden === "jegSokerForEgetBarnUnder18Ar")
    || (data.hvemFyllerUtSoknaden === "jegSokerForEnPersonSomJegErVergeFor");`,
    `show = (data.sokerSelv1.harDuNoenSomKanHjelpeDegATaIBrukHjelpemiddeletOgFolgeOppBrukenAvDet1 === "jaJegHarAvtaltOpplaeringOgOppfolgingMedEnPerson")
    || (data.harDuSelvOppfolgingsOgOpplaeringsansvar === "nei");`,
  ],
  nav111205: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav111215b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.tiltakspenger === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.kvalifiseringsstonad === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.mottarIngenPengestotteFraNavMenMittLokaleNavKontorHarVurdertAtJegHarNedsattArbeidsevneSomGjorDetVanskeligereForMegAJobbe
 === true || 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.arbeidsavklaringspengerAap === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.overgangsstonadTilEnsligMorEllerFar === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.gjenlevendepensjonEtterlattepensjonOmstillingsstonad === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.uforetrygd === false && 
  data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.dagpenger === false &&
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.sykepenger === false) 
 ;`,
    `show = (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.tiltakspenger === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.kvalifiseringsstonad === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.mottarIngenPengestotteFraNavMenMittLokaleNavKontorHarVurdertAtJegHarNedsattArbeidsevneSomGjorDetVanskeligereForMegAJobbe
 === true || 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.arbeidsavklaringspengerAap === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.overgangsstonadTilEnsligMorEllerFar === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.gjenlevendepensjonEtterlattepensjonOmstillingsstonad === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.uforetrygd === false && 
  data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.dagpenger === false &&
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.sykepenger === false) 
 ;`,
    `show = (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.tiltakspenger === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.kvalifiseringsstonad === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.mottarIngenPengestotteFraNavMenMittLokaleNavKontorHarVurdertAtJegHarNedsattArbeidsevneSomGjorDetVanskeligereForMegAJobbe
 === true || 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.arbeidsavklaringspengerAap === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.overgangsstonadTilEnsligMorEllerFar === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.gjenlevendepensjonEtterlattepensjonOmstillingsstonad === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.uforetrygd === false && 
  data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.dagpenger === false &&
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.sykepenger === false) 
 ;`,
    `show = _.some(data.opplysningerOmBarn, (row) => {
return row.sokerStonadForDetteBarnet.hvemPasserBarnet === "barnehageSkolefritidsordningSfoEllerAktivitetsskoleAks";
});`,
    `show = _.some(data.opplysningerOmBarn, (row) => {
return row.sokerStonadForDetteBarnet.hvemPasserBarnet === "dagmammaPraktikantEllerAnnenPrivatOrdning";
});`,
    `show = _.some(data.opplysningerOmBarn, (row) => {
return row.sokerStonadForDetteBarnet.hvaErArsakenTilAtBarnetDittTrengerPass === "jegMaVaereBorteFraHjemmetPaKvelden";
});`,
    `show = _.some(data.opplysningerOmBarn, (row) => {
return row.sokerStonadForDetteBarnet.hvaErArsakenTilAtBarnetDittTrengerPass === "trengerMerPleieEllerTilsynEnnDetSomErVanligForJevnaldrende";
});`,
  ],
  nav111216b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
    `show = (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.tiltakspenger === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.kvalifiseringsstonad === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.mottarIngenPengestotteFraNavMenMittLokaleNavKontorHarVurdertAtJegHarNedsattArbeidsevneSomGjorDetVanskeligereForMegAJobbe
 === true || 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.arbeidsavklaringspengerAap === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.overgangsstonadTilEnsligMorEllerFar === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.gjenlevendepensjonEtterlattepensjonOmstillingsstonad === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.uforetrygd === false && 
  data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.dagpenger === false &&
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.sykepenger === false) 
 ;`,
    `show = (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.tiltakspenger === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.kvalifiseringsstonad === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.mottarIngenPengestotteFraNavMenMittLokaleNavKontorHarVurdertAtJegHarNedsattArbeidsevneSomGjorDetVanskeligereForMegAJobbe
 === true || 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.arbeidsavklaringspengerAap === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.overgangsstonadTilEnsligMorEllerFar === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.gjenlevendepensjonEtterlattepensjonOmstillingsstonad === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.uforetrygd === false && 
  data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.dagpenger === false &&
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.sykepenger === false) 
 ;`,
    `show = (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.tiltakspenger === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.kvalifiseringsstonad === true || 
data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.mottarIngenPengestotteFraNavMenMittLokaleNavKontorHarVurdertAtJegHarNedsattArbeidsevneSomGjorDetVanskeligereForMegAJobbe
 === true || 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.arbeidsavklaringspengerAap === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.overgangsstonadTilEnsligMorEllerFar === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.gjenlevendepensjonEtterlattepensjonOmstillingsstonad === false && 
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.uforetrygd === false && 
  data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.dagpenger === false &&
 data.mottarDuEllerHarDuNyligSoktOmNoeAvDette.sykepenger === false) 
 ;`,
  ],
  nav111217b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
    `show= data.velgLandReiseTilSamling.value === "NO";`,
    `show= data.velgLandReiseTilSamling.value !== "NO";`,
    `show = row.bompenger > 0 || row.piggdekkavgift > 0 || row.ferje > 0 || row.annet > 0 || row.parkering > 0;`,
    `show = data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.bompenger > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.parkering > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.piggdekkavgift > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.ferje > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.annet > 0;`,
  ],
  nav111218b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
    `show= data.velgLand3.value === "NO";`,
    `show= data.velgLand3.value !== "NO";`,
    `show = row.bompenger > 0 || row.piggdekkavgift > 0 || row.ferje > 0 || row.annet > 0 || row.parkering > 0;`,
    `show = data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.bompenger > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.parkering > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.piggdekkavgift > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.ferje > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.annet > 0;`,
  ],
  nav111219: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hovedytelse.tiltakspenger === true || 
data.hovedytelse.kvalifiseringsstonad === true || 
data.hovedytelse.dagpenger
 === true || 
data.hovedytelse.sykepenger
 === true || 
 data.hovedytelse.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.hovedytelse.arbeidsavklaringspenger === false && 
 data.hovedytelse.overgangsstonad === false && 
 data.hovedytelse.gjenlevendepensjon === false &&
 data.hovedytelse.mottarIngenPengestotte === false &&
 data.hovedytelse.uforetrygd === false) 
 ;`,
    `show = (data.hovedytelse.tiltakspenger === true || 
data.hovedytelse.kvalifiseringsstonad === true || 
data.hovedytelse.mottarIngenPengestotte
 === true || 
 data.hovedytelse.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.hovedytelse.arbeidsavklaringspenger === false && 
 data.hovedytelse.overgangsstonad === false && 
 data.hovedytelse.gjenlevendepensjon === false && 
 data.hovedytelse.uforetrygd === false && 
  data.hovedytelse.dagpenger === false &&
 data.hovedytelse.sykepenger === false) 
 ;`,
    `show = (data.arbeidOgOpphold.harPengestotteAnnetLand.sykepenger === true || 
data.arbeidOgOpphold.harPengestotteAnnetLand.pensjon === true || 
data.arbeidOgOpphold.harPengestotteAnnetLand.annenPengestotte  === true ) 
;`,
    `show = data.aktiviteter.aktiviteterOgMaalgruppe.aktivitet.aktivitetId === "ingenAktivitet";`,
    `show = (data.aktiviteter.aktiviteterOgMaalgruppe.aktivitet.text && 
data.aktiviteter.aktiviteterOgMaalgruppe.aktivitet.aktivitetId !== "ingenAktivitet" &&
!data.aktiviteter.aktiviteterOgMaalgruppe.aktivitet.text.startsWith("Ordinær utdanning for enslige forsørgere mv"))
|| (data.aktiviteter.arbeidsrettetAktivitet === 'tiltakArbeidsrettetUtredning')
;`,
  ],
  nav111219b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
  ],
  nav111221: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer);`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = ( 
data.hovedytelse.mottarIngenPengestotte
 === true || 
 data.hovedytelse.ingenAvAlternativenePasserForMeg === true) 
 && 
 (data.hovedytelse.arbeidsavklaringspenger === false && 
 data.hovedytelse.overgangsstonad === false && 
 data.hovedytelse.gjenlevendepensjon === false && 
 data.hovedytelse.uforetrygd === false && 
  data.hovedytelse.dagpenger === false &&
 data.hovedytelse.sykepenger === false) 
 ;`,
    `show = (data.arbeidOgOpphold.harPengestotteAnnetLand.sykepenger === true || 
data.arbeidOgOpphold.harPengestotteAnnetLand.pensjon === true || 
data.arbeidOgOpphold.harPengestotteAnnetLand.annenPengestotte  === true ) 
;`,
    `show = utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).empty || utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).failure;`,
    `show = utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).fetchDisabled || utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).empty || utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).failure || data.aktiviteter.aktiviteterOgMaalgruppe.aktivitet.aktivitetId === "ingenAktivitet";`,
    `show = utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).selected('COUNT') > 0 || data.aktiviteter.arbeidsrettetAktivitet === 'tiltakArbeidsrettetUtredning' || data.aktiviteter.arbeidsrettetAktivitet === 'utdanningGodkjentAvNav';`,
    `show = (data.hovedytelse.arbeidsavklaringspenger === true || data.hovedytelse.uforetrygd === true || data.hovedytelse.sykepenger === true || data.hovedytelse.mottarIngenPengestotte === true || data.hovedytelse.ingenAvAlternativenePasserForMeg === true) && data.aktiviteter.faktiskeUtgifter.garDuPaVideregaendeEllerGrunnskole === 'annetTiltak';`,
    `show = row.kanDuKjoreMedEgenBil === 'ja'`,
    `show = (row.hvaErViktigsteGrunnerTilAtDuIkkeKanBrukeOffentligTransport.helsemessigeArsaker === true && row.kanKjoreMedEgenBil === 'ja')
|| (row.kanDuReiseMedOffentligTransport === 'kombinertTogBil' && row.hvaErViktigsteGrunnerTilAtDuIkkeKanBrukeOffentligTransport.helsemessigeArsaker === true);`,
    `show = (row.hvorforIkkeBil.helsemessigeArsaker === true || row.hvaErViktigsteGrunnerTilAtDuIkkeKanBrukeOffentligTransport.helsemessigeArsaker === true || row.harDuAvMedisinskeArsakerBehovForTransportUavhengigAvReisensLengde === 'ja') && row.reiseMedTaxi === 'ja';`,
    `show = row.kanDuReiseMedOffentligTransport === 'ja' || row.kanDuReiseMedOffentligTransport === 'kombinertTogBil';`,
    `show = row.kanDuReiseMedOffentligTransport === 'kombinertTogBil' || row.kanKjoreMedEgenBil === 'ja';`,
    `show = _.some(data.reise, (r) => r.harDuAvMedisinskeArsakerBehovForTransportUavhengigAvReisensLengde === 'ja');`,
    `show = _.some(data.reise, (r) => r.hvaErViktigsteGrunnerTilAtDuIkkeKanBrukeOffentligTransport.helsemessigeArsaker === true);`,
    `show = _.some(data.reise, (r) => r.hvorforIkkeBil.helsemessigeArsaker === true);`,
    `show = _.some(data.reise, (r) => r.ttKort === 'ja');`,
    `show = _.some(data.reise, (r) => r.reiseMedTaxi === 'ja');`,
  ],
  nav111221b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
    `show = data.velgLand1.value === "NO";`,
    `show= data.velgLand1.value !== "NO";`,
    `show = row.bompenger > 0 || row.piggdekkavgift > 0 || row.ferje > 0 || row.annet > 0 || row.parkering > 0;`,
    `show = data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.bompenger > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.parkering > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.piggdekkavgift > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.ferje > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.annet > 0;`,
  ],
  nav111222b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
    `show= data.velgLandArbeidssoker.value === "NO";`,
    `show= data.velgLandArbeidssoker.value !== "NO";`,
    `show = data.hvorforReiserDuArbeidssoker === "jobbintervju" || data.hvorforReiserDuArbeidssoker === "arbeidPaNyttSted";`,
    `show = !!row.bompenger || !!row.parkering || !!row.piggdekkavgift || !!row.ferje || !!row.annet;`,
    `show = data.hvorforReiserDuArbeidssoker === "jobbintervju" || data.hvorforReiserDuArbeidssoker === "arbeidPaNyttSted";`,
    `show = !!data.kanIkkeReiseKollektivtArbeidssoker.kanBenytteEgenBil.bompenger || !!data.kanIkkeReiseKollektivtArbeidssoker.kanBenytteEgenBil.parkering || !!data.kanIkkeReiseKollektivtArbeidssoker.kanBenytteEgenBil.piggdekkavgift || !!data.kanIkkeReiseKollektivtArbeidssoker.kanBenytteEgenBil.ferje || !!data.kanIkkeReiseKollektivtArbeidssoker.kanBenytteEgenBil.annet;`,
  ],
  nav111223b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = !data.aktiviteterOgMaalgruppe.maalgruppe.prefilled`,
    `show= data.velgLand1.value === "NO";`,
    `show= data.velgLand1.value !== "NO";`,
    `show = data.ordnerDuFlyttingenSelvEllerKommerDuTilABrukeFlyttebyra === "jegFlytterSelv" || data.ordnerDuFlyttingenSelvEllerKommerDuTilABrukeFlyttebyra === "jegHarInnhentetTilbudFraMinstToFlyttebyraerMenVelgerAFlytteSelv";`,
    `show = data.ordnerDuFlyttingenSelvEllerKommerDuTilABrukeFlyttebyra === "jegVilBrukeFlyttebyra" || data.ordnerDuFlyttingenSelvEllerKommerDuTilABrukeFlyttebyra === "jegHarInnhentetTilbudFraMinstToFlyttebyraerMenVelgerAFlytteSelv";`,
  ],
  nav111224b: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `const dates = data.drivinglist.dates || []
show = dates.some(date => parseInt(date.parking) > 100)`,
  ],
  nav111305: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.harDuJobbetUtenforNorgeDeFemSisteArene === "ja")
    || (data.harDuITilleggTilJobbINorgeOgsaJobbetIEtAnnetLandDeFemSisteArene === "ja");`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandJobbetDuI1.value)
   ;`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandVarDuI1.value)
   ;`,
    `show = (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.ingenAvDisse === true)
    &&
      ((data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.godtgjorelseEllerLonnForVerv === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.okonomiskSosialhjelp === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.omsorgsstonadTidligereOmsorgslonn === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.introduksjonsstonadIntroduksjonsprogrammet === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.kvalifiseringsstonadKvalifiseringsprogrammet === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.ytelserFraUtenlandskeTrygdemyndigheter === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.avtalefestetPensjonAfp === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.lanFraLanekassen === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.sykestipendFraLanekassen === true));`,
    `show = (data.harDuFattEllerSkalDuFaEkstraUtbetalingerFraArbeidsgiver === "ja")
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.omsorgsstonadTidligereOmsorgslonn === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.ytelserFraUtenlandskeTrygdemyndigheter === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.lanFraLanekassen === true)
    || (data.kryssAvForUtbetalingerDuFarEllerNyligHarSoktOm.sykestipendFraLanekassen === true);`,
    `show = _.some(data.leggTilBarn, (row) => { 

return row.hvilkenRelasjonHarDuTilBarnet === "fosterforelder"; 

});`,
    `show = _.some(data.leggTilBarn, (row) => { 

return row.hvilkenRelasjonHarDuTilBarnet === "forelder"; 

});`,
  ],
  nav111308: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.erSoknadenDinAvslattInnvilgetEllerVenterDuFortsattPaSvar === "soknadenErInnvilget") ||
       (data.erSoknadenDinAvslattInnvilgetEllerVenterDuFortsattPaSvar === "soknadenErAvslatt");`,
    `show=
(data.planleggerDuAForetaEnMarkedsundersokelse === "nei") &&
(data.harDuForetattEnMarkedsundersokelse === "nei");`,
    `show = (data.angiStatusForSoknaden === "soknadenErInnvilget") ||
       (data.angiStatusForSoknaden === "soknadenErAvslatt") ||
       (data.harDuSoktEllerSkalDuSokeAnnenFormForOkonomiskStotteTilEtableringen === "ja");`,
  ],
  nav111309: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.erSoknadenDinAvslattInnvilgetEllerVenterDuFortsattPaSvar === "soknadenErInnvilget") ||
       (data.erSoknadenDinAvslattInnvilgetEllerVenterDuFortsattPaSvar === "soknadenErAvslatt");`,
    `var hide = (data.soknadenGjelder === "utviklingsfase");
show = !hide;`,
    `show = (data.erSoknadenDinAvslattInnvilgetEllerVenterDuFortsattPaSvar === "soknadenErInnvilget") ||
       (data.erSoknadenDinAvslattInnvilgetEllerVenterDuFortsattPaSvar === "soknadenErAvslatt") ||
       (data.harDuSoktEllerSkalDuSokeOmAnnenFormForOkonomiskStotteTilEtableringen === "ja");`,
  ],
  nav120605: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.erDuIArbeidNa === "ja")
|| (data.erDuNaeringsdrivende === "ja");`,
    `show = (data.hvaErDinSivilstatus === "samboer")
&&  (data.harDuBarnUnder18Ar === "ja");`,
    `show = (data.hvaErDinSivilstatus === "giftEllerPartner")
&&  (data.harDuBarnUnder18Ar === "ja");`,
    `show = _.some(data.opplysningerOmBarnUnder18Ar, (rad) => {
  return rad.personalia.harDetteBarnetNorskFodselsnummerEllerDNummer === "nei";  
  
});`,
    `show = _.some(data.opplysningerOmBarnUnder18Ar, (rad) => {
  return rad.personalia.harBarnetEllerBarnaLegitimasjonMedBilde === "ja";  
  
});`,
    `show = _.some(data.opplysningerOmBarnUnder18Ar, (rad) => {
    return rad.betalesDetBidragForBarnetViaNav === "nei"; 
  
});`,
  ],
  nav121501: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = _.some(data.opplysningerOmBarnUnder18Ar, (rad) => {
  return rad.personalia.harDetteBarnetNorskFodselsnummerEllerDNummer === "nei";  
  
});`,
    `show = _.some(data.opplysningerOmBarnUnder18Ar, (rad) => {
  return rad.personalia.harBarnetEllerBarnaLegitimasjonMedBilde === "ja";  
  
});`,
    `show = _.some(data.opplysningerOmBarnUnder18Ar, (rad) => {
    return rad.betalesDetBidragForBarnetViaNav === "nei"; 
  
});`,
  ],
  nav131305: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav131705: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.mottarDuBehandlingForDinYrkesskadeSykdom === "ja") 
    || (data.harDuMottattBehandlingForYrkesskadenYrkessykdommenTidligere === "ja");`,
  ],
  nav140410: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav140506: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemErDu === "mor")
    || (data.hvemErDu === "far")
    || (data.hvemErDu === "medmor");`,
    `show = (data.hvemErDu === "mor")
    || (data.hvemErDu === "far")
    || (data.hvemErDu === "medmor");`,
    `show = (data.hvorMangeBarnSkalDuAdoptere === 1)
    || (data.hvorMangeBarnOvertarDuOmsorgenFor === 1);`,
    `show = ((data.hvorMangeBarnSkalDuAdoptere > 1)
    && (data.hvorMangeBarnSkalDuAdoptere < 10))
    || ((data.hvorMangeBarnOvertarDuOmsorgenFor > 1)
    && (data.hvorMangeBarnOvertarDuOmsorgenFor < 10));`,
    `show = (data.hvemErDu === "mor")
    || (data.hvemErDu === "far")
    || (data.hvemErDu === "medmor");`,
    `show = ((data.hvemErDu === "far")
     || (data.hvemErDu === "medmor"))
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei"));`,
    `show = (data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "ja");`,
    `show = (data.hvemErDu === "far")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "ja"));`,
    `show = (data.hvemErDu === "medmor")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "ja"));`,
    `show = (data.hvilkenPeriodeSkalDuTaUtFar.fellesperiode === true)
    || (data.hvilkenPeriodeSkalDuTaUtMedmor.fellesperiode === true);`,
    `show = (data.hvemErDu === "mor")
    && (data.harDenAndreForelderenRettTilForeldrepenger === "nei")
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei"));`,
    `show = (data.hvemErDu === "far")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "nei")
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei")));`,
    `show = (data.hvemErDu === "medmor")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "nei")
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei")));`,
    `show = (data.kanDuGiOssNavnetPaDenAndreForelderen === "nei")
    || (data.erDuAleneOmOmsorgenAvBarnet === "ja");`,
    `show = (data.mor.hvilkenPeriodeSkalDuTaUtMor.overforingAvAnnenForeldersKvote === true)
    || (data.hvilkenPeriodeSkalDuTaUtFar.overforingAvAnnenForeldersKvote === true)
    || (data.hvilkenPeriodeSkalDuTaUtMedmor.overforingAvAnnenForeldersKvote === true);`,
    `show = (data.harDuBlittYrkesaktivILopetAvDetSisteAret === "ja")
    || (data.harDuBlittYrkesaktivILopetAvDe3SisteFerdiglignedeArene === "ja");`,
    `show = (data.hvemErDu === "mor")
    || (data.hvemErDu === "far")
    || (data.hvemErDu === "medmor");`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
       (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "utdanningPaHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "kvalifiseringsprogrammet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "introduksjonsprogrammet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErForSykTilATaSegAvBarnet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErInnlagtPaHelseinstitusjon";
}));`,
  ],
  nav140507: [
    `show = (data.hvaSokerDuOm === "engangsstonadVedFodsel")
     & (data.narErBarnetFodt === "fremITid");`,
  ],
  nav140509: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.barnetErFodt.hvorMangeBarnFikkDu > 1)
    && (data.barnetErFodt.hvorMangeBarnFikkDu < 10);`,
    `show = (data.barnetErFodt.hvorMangeBarnFikkDu > 1)
    && (data.barnetErFodt.hvorMangeBarnFikkDu < 10);`,
    `show = ((data.hvemErDu === "far")
     || (data.hvemErDu === "medmor"))
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei"));`,
    `show = (data.kanDuGiOssNavnetPaDenAndreForelderen === "nei")
    || (data.erDuAleneOmOmsorgenAvBarnet === "ja");`,
    `show = (data.harDenAndreForelderenRettTilForeldrepenger === "nei")
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei"));`,
    `show = (data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "ja");`,
    `show = (data.hvemErDu === "far")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "ja"));`,
    `show = (data.hvemErDu === "medmor")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "ja"));`,
    `show = (data.mor.hvilkenPeriodeSkalDuTaUtAleneMor.foreldrepengerForFodsel === true)
    || (data.mor.hvilkenPeriodeSkalDuTaUtKunMorRett.foreldrepengerForFodsel === true)
    || (data.mor.hvilkenPeriodeSkalDuTaUtMor.foreldrepengerForFodsel === true);`,
    `show = (data.hvilkenPeriodeSkalDuTaUtFar.fellesperiode === true)
    || (data.hvilkenPeriodeSkalDuTaUtMedmor.fellesperiode === true);`,
    `show = (data.hvemErDu === "far")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "nei")
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei")));`,
    `show = (data.hvemErDu === "medmor")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "nei")
    && ((data.harDenAndreForelderenOppholdtSegFastIEtAnnetEosLandEnnNorgeEttArForBarnetBleFodt === "nei")
     || (data.harDenAndreForelderenArbeidetEllerMottattPengestotteIEtEosLandIMinstSeksAvDeSisteTiManedeneForBarnetBleFodt === "nei")));`,
    `show = ((data.hvemErDu === "far")
     || (data.hvemErDu === "medmor"))
    && ((data.kanDuGiOssNavnetPaDenAndreForelderen === "nei")
     || (data.erDuAleneOmOmsorgenAvBarnet === "ja"));`,
    `show = (data.mor.hvilkenPeriodeSkalDuTaUtMor.overforingAvAnnenForeldersKvote === true)
    || (data.hvilkenPeriodeSkalDuTaUtFar.overforingAvAnnenForeldersKvote === true)
    || (data.hvilkenPeriodeSkalDuTaUtMedmor.overforingAvAnnenForeldersKvote === true);`,
    `show = (data.harDuBlittYrkesaktivILopetAvDetSisteAret === "ja")
    || (data.harDuBlittYrkesaktivILopetAvDe3SisteFerdiglignedeArene === "ja");`,
    `show = (data.barnetErFodt.erBarnetRegistrertIDetNorskeFolkeregisteret === "nei")
    || (data.barnetErFodt.erBarnaRegistrertIDetNorskeFolkeregisteret === "nei");`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
       (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "utdanningPaHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "kvalifiseringsprogrammet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "introduksjonsprogrammet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErForSykTilATaSegAvBarnet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErInnlagtPaHelseinstitusjon";
}));`,
  ],
  nav141605: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemErDu === "mor")
    || (data.hvemErDu === "far")
     || (data.hvemErDu === "medmor");`,
    `show = (data.hvemErDu === "mor")
    || (data.hvemErDu === "jegHarOvertattForeldreansvaret")
    || (((data.hvemErDu === "far")
     || (data.hvemErDu === "medmor"))
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.erDuAleneOmOmsorgenAvBarnet === "ja")));`,
    `show = (data.hvemErDu === "far")
    || (data.hvemErDu === "medmor")
    || (data.hvemErDu === "jegHarOvertattForeldreansvaret");`,
    `show = (data.hvaSokerDuOm.periodeMedForeldrepenger === true)
    || (data.hvaSokerDuOmIkkeMor.periodeMedForeldrepenger === true)
    || (((data.hvemErDu === "medmor")
      || (data.hvemErDu === "far"))
      && (data.harDenAndreForelderenRettTilForeldrepenger === "nei"));`,
    `show = (data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.bleDuAleneOmOmsorgenForEllerEtterOppstartAvForeldrepengene === "jegHarBlittAleneOmOmsorgenEtterAtJegHarFattForeldrepenger");`,
    `show = (data.hvemErDu === "far")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.bleDuAleneOmOmsorgenForEllerEtterOppstartAvForeldrepengene === "jegHarBlittAleneOmOmsorgenEtterAtJegHarFattForeldrepenger"));`,
    `show = (data.hvemErDu === "medmor")
    && ((data.harDenAndreForelderenRettTilForeldrepenger === "ja")
    || (data.bleDuAleneOmOmsorgenForEllerEtterOppstartAvForeldrepengene === "jegHarBlittAleneOmOmsorgenEtterAtJegHarFattForeldrepenger"));`,
    `show = (data.mor.hvilkenPeriodeSkalDuTaUtAleneMor.foreldrepengerForFodsel === true)
    || (data.mor.hvilkenPeriodeSkalDuTaUtKunMorRett.foreldrepengerForFodsel === true)
    || (data.mor.hvilkenPeriodeSkalDuTaUtMor.foreldrepengerForFodsel === true);`,
    `show = (data.hvilkenPeriodeSkalDuTaUtFar.fellesperiode === true)
    || (data.hvilkenPeriodeSkalDuTaUtMedmor.fellesperiode === true);`,
    `show = (data.hvemErDu === "far")
    && (data.harDenAndreForelderenRettTilForeldrepenger === "nei");`,
    `show = (data.hvemErDu === "medmor")
    && (data.harDenAndreForelderenRettTilForeldrepenger === "nei");`,
    `show = ((data.hvemErDu === "far")
     || (data.hvemErDu === "medmor"))
    && (data.bleDuAleneOmOmsorgenForEllerEtterOppstartAvForeldrepengene === "jegVarAleneOmOmsorgenForJegFikkForeldrepenger");`,
    `show = (data.mor.hvilkenPeriodeSkalDuTaUtMor.overforingAvAnnenForeldersKvote === true)
    || (data.hvilkenPeriodeSkalDuTaUtFar.overforingAvAnnenForeldersKvote === true)
    || (data.hvilkenPeriodeSkalDuTaUtMedmor.overforingAvAnnenForeldersKvote === true);`,
    `show = (data.hvaSokerDuOm.periodeUtenForeldrepenger === true)
    || (data.hvaSokerDuOmIkkeMor.periodeUtenForeldrepenger === true);`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
       (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "utdanningPaHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "utdanningPaHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "arbeidOgUtdanningSomTilSammenBlirHeltid";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "kvalifiseringsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "kvalifiseringsprogrammet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "introduksjonsprogrammet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "introduksjonsprogrammet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "forSykTilATaSegAvBarnet";
}))
    ||
      (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErForSykTilATaSegAvBarnet";
}));`,
    `show = (_.some(data.fellesperiodeFarMedmor, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePerioden === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunFarRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "innlagtPaHelseinstitusjon";
}))
    ||
      (_.some(data.kunMedmorRett, (row) => {
return row.hvaSkalMorGjoreIDennePeriodenOpphold === "innlagtPaHelseinstitusjon";
}))
    || 
      (((data.hvemErDu === "far")
    || (data.hvemErDu === "medmor"))
    && 
      (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErInnlagtPaHelseinstitusjon";
})));`,
    `show =  (data.hvemErDu === "mor")
    && (_.some(data.jegSokerOmAOvertaKvotenTilDenAndreForelderen, (row) => {
return row.hvorforSkalDuOvertaKvoten === "denAndreForelderenErInnlagtPaHelseinstitusjon";
}));`,
    `show =  (_.some(data.perioderMedUtsettelseForste6UkerEtterFodsel, (row) => {
return row.hvorforSkalDuUtsetteForeldrepenger === "jegErForSykTilATaMegAvBarnet";
}));`,
    `show =  (_.some(data.perioderMedUtsettelseForste6UkerEtterFodsel, (row) => {
return row.hvorforSkalDuUtsetteForeldrepenger === "jegErInnlagtIHelseinstitusjon";
}));`,
    `show =  (_.some(data.perioderMedUtsettelseForste6UkerEtterFodsel, (row) => {
return row.hvorforSkalDuUtsetteForeldrepenger === "barnetErInnlagtIHelseinstitusjon";
}));`,
  ],
  nav150001: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show =  (data.hvaErDinSivilstand === "giftRegistrertPartnerskap")
     || (data.hvaErDinSivilstand === "separert")
     || (data.hvaErDinSivilstand === "skilt")
     || (data.hvaErDinSivilstand === "soktOmSeparasjon")
     || (data.hvaErDinSivilstand === "soktOmSkilsmisse")
     || (data.hvaErDinSivilstand === "enkeEnkemann")
;`,
    `show =  (data.hvaErDinSivilstand === "separert")
     || (data.hvaErDinSivilstand === "skilt")
;`,
    `show = (data.hvaErDinSivilstand === "ugift")
    || (data.hvaErDinSivilstand === "separert")
    || (data.hvaErDinSivilstand === "skilt");`,
    `show = (data.delerDuBoligMedAndreVoksne === "neiJegBorAleneMedBarnEllerJegErGravidOgBorAlene")
    || (data.delerDuBoligMedAndreVoksne === "jaJegDelerBoligMedAndreVoksneForEksempelUtleierVennSoskenEllerEgneForeldre")
    || (data.delerDuBoligMedAndreVoksne === "neiMenEnTidligereSamboerErFortsattRegistrertPaAdressenMin")
    ;`,
    `show=
(row.skalDenAndreForelderenHaSamvaerMedBarnet1 === "jaMenIkkeMerEnnEnEttermiddagIUkenMedOvernattingOgAnnenhverHelgEllerTilsvarende") ||
(row.skalDenAndreForelderenHaSamvaerMedBarnet1 === "jaMerEnnEnEttermiddagIUkenMedOvernattingOgAnnenhverHelgEllerTilsvarende");`,
    `show = (row.harDereSkriftligSamvaersavtaleForBarnet1 === "jaMenDenBeskriverIkkeNarBarnetSkalVaereSammenMedHverAvForeldrene")
    || (row.harDereSkriftligSamvaersavtaleForBarnet1 === "nei");`,
    `show = ((data.oppholderDuOgBarnetBarnaDereINorge === "ja")
     && (row.kanOppgiForelder.borBarnetsAndreForelderINorge === "ja"))
    || ((data.oppholderDuOgBarnetBarnaDereINorge === "nei")
     && (row.kanOppgiForelder.borBarnetsAndreForelderINorge === "nei"));`,
    `show = _.some(data.opplysningerOmBarnUnder18ArSomDuHarOmsorgenFor, (row) => { 

return (row.harDenAndreForelderenSamvaerMedBarnet === "jaMenIkkeMerEnnEnEttermiddagIUkenMedOvernattingOgAnnenhverHelgEllerTilsvarende")
    || (row.harDenAndreForelderenSamvaerMedBarnet === "jaMerEnnEnEttermiddagIUkenMedOvernattingOgAnnenhverHelgEllerTilsvarende");
  
});`,
    `show = (row.harDereSkriftligSamvaersavtaleForBarnet2 === "jaMenDenBeskriverIkkeNarBarnetErSammenMedHverAvForeldrene")
    || (row.harDereSkriftligSamvaersavtaleForBarnet2 === "nei");`,
    `show = ((data.oppholderDuOgBarnetBarnaDereINorge === "ja")
     && (row.kanOppgiForelder.borBarnetsAndreForelderINorge2 === "ja"))
    || ((data.oppholderDuOgBarnetBarnaDereINorge === "nei")
     && (row.kanOppgiForelder.borBarnetsAndreForelderINorge2 === "nei"));`,
    `show = (data.erDuSeparertEllerSkiltUtenAtDetteErRegistrertIFolkeregisteretINorge === "nei")
    && (data.hvorforErDuAleneMedBarn === "samlivsbruddMedDenAndreForelderen");`,
    `show = _.some(data.barnMedTermin, (row) => { 

return row.skalDuOgDenAndreForelderenHaSkriftligAvtaleOmDeltFastBostedForBarnet === "ja";
  
})
    
||
   _.some(data.opplysningerOmBarnUnder18ArSomDuHarOmsorgenFor, (row) => { 

return row.harDuOgDenAndreForelderenHaSkriftligAvtaleOmDeltFastBostedForBarnet2 === "ja";

});`,
    `show = _.some(data.barnMedTermin, (row) => { 

return (row.harDereSkriftligSamvaersavtaleForBarnet1 === "jaOgDenBeskriverNarBarnetErSammenMedHverAvForeldrene")
    || (row.harDereSkriftligSamvaersavtaleForBarnet1 === "jaMenDenBeskriverIkkeNarBarnetErSammenMedHverAvForeldrene");
  
})
    
||
   _.some(data.opplysningerOmBarnUnder18ArSomDuHarOmsorgenFor, (row) => { 

return (row.harDereSkriftligSamvaersavtaleForBarnet2 === "jaOgDenBeskriverNarBarnetErSammenMedHverAvForeldrene")
    || (row.harDereSkriftligSamvaersavtaleForBarnet2 === "jaMenDenBeskriverIkkeNarBarnetErSammenMedHverAvForeldrene");

});`,
    `show = _.some(data.omArbeidsforholdetDitt, (row) => { 

return row.hvaSlagsAnsettelsesforholdHarDu === "laerling";
  
});`,
    `show = (data.farDuAlleredeOvergangsstonadOgSokerDuOmAForlengeStonadsperiodenUtover3ArFordiDuHarEnSykdomSomIkkeErVarig === "ja")
   || (data.harDuSykmeldingMottarArbeidsavklaringspengerEllerUforetrygd === "nei");`,
  ],
  nav150004: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show =
(data.angiDinSivilstand === "separert") ||
(data.angiDinSivilstand === "skilt");`,
    `show =
(data.angiDinSivilstand === "separert") ||
(data.angiDinSivilstand === "skilt");`,
    `show=
(data.angiDinSivilstand !== "samboer") && (data.angiDinSivilstand !== "");`,
    `show =
((data.angiDinSivilstand !== "giftRegistrertPartnerskap") && (data.angiDinSivilstand !== "samboer") && (data.angiDinSivilstand !== "")) ;`,
    `show=
(row.borBarnetFastSammenMedDeg === "neiViHarDeltBostedEtterBarneloven");`,
    `show=
(row.harDereSkriftligSamvaersavtale === "nei") ||
(row.inneholderAvtalenKonkreteTidspunktForSamvaer === "nei");`,
    `show=
(row.kjennerDuTilOmDenAndreForelderenHarNorskFodselsnummerEllerDNummer === "nei") ||
(row.vetDuHvaDetteNummeretEr === "nei");`,
    `show =
(data.typeUtdanning === "videregaendeSkole") || (data.typeUtdanning === "annenUtdanning");`,
    `show =
(data.typeUtdanning === "fagskole") || (data.typeUtdanning === "hoyereUtdanning");`,
    `show=
(data.hvilkeUtgifterSokerDuStonadTil.eksamensgebyr === true) ||
(data.hvilkeUtgifterSokerDuStonadTil.semesteravgift === true) || 
(data.hvilkeUtgifterSokerDuStonadTil.skolepenger === true);`,
    `show = _.some(data.barnUnder18ArSomDuHarOmsorgenFor, (rad) => {
  return rad.termindato === "ja";
});`,
    `show = _.some(data.barnUnder18ArSomDuHarOmsorgenFor, (rad) => {
  return rad.harDereSkriftligSamvaersavtale === "ja";
});`,
    `show =
(data.angiDinSivilstand === "separert") ||
(data.angiDinSivilstand === "skilt");`,
    `show =
(data.angiDinSivilstand === "soktOmSeparasjon") ||
(data.angiDinSivilstand === "soktOmSkilsmisse");`,
    `show = _.some(data.barnUnder18ArSomDuHarOmsorgenFor, (rad) => {
  return rad.hvordanErDeltBostedAvtalt === "skriftligAvtale";
});`,
    `show = _.some(data.barnUnder18ArSomDuHarOmsorgenFor, (rad) => {
  return rad.hvordanErDeltBostedAvtalt === "avgjorelseFraDomstolene";
});`,
  ],
  nav150801: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav170106: [
    `show = utils.isAgeBetween([67, 130], 'fodselsdatoDdMmAaaaSoker', submission)`,
    `show = (data.onskerDuAMottaUtbetalingenPaNorskEllerUtenlandskBankkonto === "utenlandskKontonummer")
    && (data.jegHarSjekketAtNavAlleredeHarRegistrertMittUtenlandskeBankkontonummer !== true);`,
    `show = !["NO"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = (data.utenlandskKontonummer.bankensLand.value !== undefined) && (!["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value));`,
    `show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["AU"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["CA"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `var hide = ["US", "AS", "VI", "UM"].includes(data.utenlandskKontonummer.bankensLand.value); 
show = !hide;`,
    `show = ["AU"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["CA"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["US"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["IN"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = !["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = (row.eventuellArligPensjonHanEllerHunMottokFraDetteLandet > 0);`,
    `show = (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "giftEllerPartner")
    || (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "separert")
    || (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "skilt");`,
    `show = (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "samboer")
    || ((data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "tidligereSamboer")
     && (data.harEllerHarDereHattFellesBarn === "ja"));`,
    `show = (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "tidligereSamboer")
    && (data.harEllerHarDereHattFellesBarn === "ja");`,
    `show = (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "samboer")
    && (data.harEllerHarDereHattFellesBarn === "nei");`,
    `show = (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "skilt")
    && (data.harEllerHarDereHattFellesBarn === "ja");`,
    `show = (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "skilt")
    || (data.hvaVarRelasjonenDinTilAvdodeDaDodsfalletSkjedde === "tidligereSamboer");`,
    `show = (row.hvaSlagsTypeAnsettelsesforholdHarDu === "midlertidigAnsatt")
    || (row.hvaSlagsTypeAnsettelsesforholdHarDu === "tilkallingsvikarEllerLignende");`,
    `show = (row.hvaSlagsTypeAnsettelsesforholdHarDu === "midlertidigAnsatt")
    || (row.hvaSlagsTypeAnsettelsesforholdHarDu === "tilkallingsvikarEllerLignende");`,
    `show = (row.hvaSlagsTypeAnsettelsesforholdSkalDuHa === "midlertidigAnsatt")
    || (row.hvaSlagsTypeAnsettelsesforholdSkalDuHa === "tilkallingsvikarEllerLignende");`,
    `show = (data.hvaSlagsTypeAnsettelsesforholdSkalDuHa === "midlertidigAnsatt")
    || (data.hvaSlagsTypeAnsettelsesforholdSkalDuHa === "tilkallingsvikarEllerLignende");`,
    `show = ((data.hvaErSituasjonenDinNa.jegHarFattTilbudOmJobb === true)
    || (data.hvaErSituasjonenDinNa.jegTarEllerSkalTaUtdanning === true))
    && (data.erDuRegistrertSomArbeidssokerHosNav !== "ja");`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear() === dodsdato.getFullYear();`,
    `show = utils.isBornBeforeYear(1964, 'fodselsdatoDdMmAaaaSoker', submission)`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var maned = new Date(Date.now());
show = maned.getMonth()+1 > 9;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear()-1 === dodsdato.getFullYear();`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear() === dodsdato.getFullYear();`,
    `var fodselsdato = new Date(data.fodselsdatoDdMmAaaaSoker);
show = fodselsdato.getFullYear() < 1964;`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var maned = new Date(Date.now());
show = maned.getMonth()+1 > 9;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear()-1 === dodsdato.getFullYear();`,
    `var fodselsdato = new Date(data.fodselsdatoDdMmAaaaSoker);
show = fodselsdato.getFullYear() < 1964;`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear() === dodsdato.getFullYear();`,
    `var fodselsdato = new Date(data.fodselsdatoDdMmAaaaSoker);
show = fodselsdato.getFullYear() < 1964;`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var maned = new Date(Date.now());
show = maned.getMonth()+1 > 9;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear()-1 === dodsdato.getFullYear();`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear() === dodsdato.getFullYear();`,
    `var fodselsdato = new Date(data.fodselsdatoDdMmAaaaSoker);
show = fodselsdato.getFullYear() < 1964;`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `var maned = new Date(Date.now());
show = maned.getMonth()+1 > 9;`,
    `var iDag = new Date(Date.now());
var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = iDag.getFullYear()-1 === dodsdato.getFullYear();`,
    `var fodselsdato = new Date(data.fodselsdatoDdMmAaaaSoker);
show = fodselsdato.getFullYear() < 1964;`,
    `var dodsdato = new Date(data.narSkjeddeDodsfalletDdMmAaaa);
show = dodsdato.getMonth()+1 < 12;`,
    `show = !["NO"].includes(row.bankensLand.value);`,
    `show = (row.bankensLand.value !== undefined) && (!["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "NO", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(row.bankensLand.value));`,
    `show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(row.bankensLand.value);`,
    `show = ["AU"].includes(row.bankensLand.value);`,
    `show = ["CA"].includes(row.bankensLand.value);`,
    `var hide = ["US", "AS", "VI", "UM", "NO"].includes(row.bankensLand.value); 
show = !hide;`,
    `show = ["AU"].includes(row.bankensLand.value);`,
    `show = ["CA"].includes(row.bankensLand.value);`,
    `show = ["US"].includes(row.bankensLand.value);`,
    `show = ["IN"].includes(row.bankensLand.value);`,
    `show = !["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.bankensLand.value);`,
  ],
  nav170901: [
    `show = (data.hvilkenTilsynsordningHarDu.barnehage === true)
    || (data.hvilkenTilsynsordningHarDu.skolefritidsordningSfo === true);`,
  ],
  nav171501: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav180105: [
    `show = (data.hvemSokerDuBarnepensjonFor === "jegSokerForMittEllerMineBarnUnder18Ar")
|| (data.hvemSokerDuBarnepensjonFor === "jegSokerForEttEllerFlereBarnJegErVergeFor")
|| (data.hvemSokerDuBarnepensjonFor === "jegHarFylt18ArOgSokerPaVegneAvMegSelv");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemSokerDuBarnepensjonFor === "jegSokerForMittEllerMineBarnUnder18Ar")
    || (data.hvemHarBarnetEllerBarnaMistet === "enForelder")
    || (data.hvemHarDuMistet === "enForelder");`,
    `show = (data.hvemSokerDuBarnepensjonFor === "jegSokerForMittEllerMineBarnUnder18Ar")
    || ((data.hvemSokerDuBarnepensjonFor === "jegSokerForEttEllerFlereBarnJegErVergeFor")
     && (data.hvemHarBarnetEllerBarnaMistet === "enForelder"));`,
    `show = (data.kunForeldreEllerVerge.harHanEllerHunBoddOgEllerArbeidetIEtAnnetLandEnnNorgeEtterFylte16Ar === "ja")
    || (data.kunBarn1.harHanEllerHunBoddOgEllerArbeidetIEtAnnetLandEnnNorgeEtterFylte16Ar === "ja");`,
    `show = (row.eventuellArligPensjonHanEllerHunMottokFraDetteLandet > 0);`,
    `show = (data.hvemHarBarnetEllerBarnaMistet === "enForelder")
    || (data.hvemHarDuMistet === "enForelder");`,
    `show = (data.hvemHarBarnetEllerBarnaMistet === "beggeForeldrene")
    || (data.hvemHarDuMistet === "beggeForeldrene");`,
    `show = (data.hvemSokerDuBarnepensjonFor === "jegSokerForEttEllerFlereBarnJegErVergeFor")
     && (data.hvemHarBarnetEllerBarnaMistet === "beggeForeldrene");`,
    `show = (data.kunForeldreEllerVerge1.harHanEllerHunBoddOgEllerArbeidetIEtAnnetLandEnnNorgeEtterFylte16Ar === "ja")
    || (data.kunBarn2.harHanEllerHunBoddOgEllerArbeidetIEtAnnetLandEnnNorgeEtterFylte16Ar === "ja");`,
    `show = (data.hvemHarBarnetEllerBarnaMistet === "beggeForeldrene")
    || (data.hvemHarDuMistet === "beggeForeldrene");`,
    `show = (data.hvemSokerDuBarnepensjonFor === "jegSokerForEttEllerFlereBarnJegErVergeFor")
     && (data.hvemHarBarnetEllerBarnaMistet === "beggeForeldrene");`,
    `show = (data.ukjentForelder1.kunForeldreEllerVerge2.harHanEllerHunBoddOgEllerArbeidetIEtAnnetLandEnnNorgeEtterFylte16Ar === "ja")
    || (data.ukjentForelder1.kunBarn3.harHanEllerHunBoddOgEllerArbeidetIEtAnnetLandEnnNorgeEtterFylte16Ar === "ja");`,
    `show = (data.onskerDuAMottaUtbetalingenPaNorskEllerUtenlandskBankkonto === "utenlandskKontonummer")
    && (data.jegHarSjekketAtNavAlleredeHarRegistrertMittUtenlandskeBankkontonummer !== true);`,
    `show = !["NO"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = (data.utenlandskKontonummer.bankensLand.value !== undefined) && (!["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value));`,
    `show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["AU"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["CA"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `var hide = ["US", "AS", "VI", "UM"].includes(data.utenlandskKontonummer.bankensLand.value); 
show = !hide;`,
    `show = ["AU"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["CA"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["US"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["IN"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = !["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = (data.hvemSokerDuBarnepensjonFor === "jegSokerForMittEllerMineBarnUnder18Ar")
    || (data.hvemSokerDuBarnepensjonFor === "jegSokerForEttEllerFlereBarnJegErVergeFor");`,
    `show = !["NO"].includes(row.bankensLand.value);`,
    `show = (row.bankensLand.value !== undefined) && (!["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "NO", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(row.bankensLand.value));`,
    `show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(row.bankensLand.value);`,
    `show = ["AU"].includes(row.bankensLand.value);`,
    `show = ["CA"].includes(row.bankensLand.value);`,
    `var hide = ["US", "AS", "VI", "UM", "NO"].includes(row.bankensLand.value); 
show = !hide;`,
    `show = ["AU"].includes(row.bankensLand.value);`,
    `show = ["CA"].includes(row.bankensLand.value);`,
    `show = ["US"].includes(row.bankensLand.value);`,
    `show = ["IN"].includes(row.bankensLand.value);`,
    `show = !["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.bankensLand.value);`,
    `show = ["NO"].includes(row.bankensLand.value);`,
    `show = (row.hvemErForeldreTilBarnetEnForelderDod === "avdode")
    || (row.hvemErForeldreTilBarnet1 === "forelder1")
    || (row.hvemErForeldreTilBarnet1 === "forelder2");`,
    `show = (row.hvemErForeldreTilBarnetEnForelderDod === "avdodeOgGjenlevendeForelder")
    || (row.hvemErForeldreTilBarnet1 === "beggeDeAvdødeForeldrene");`,
    `show = !["NO"].includes(row.bankensLand.value);`,
    `show = (row.bankensLand.value !== undefined) && (!["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "NO", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(row.bankensLand.value));`,
    `show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(row.bankensLand.value);`,
    `show = ["AU"].includes(row.bankensLand.value);`,
    `show = ["CA"].includes(row.bankensLand.value);`,
    `var hide = ["US", "AS", "VI", "UM", "NO"].includes(row.bankensLand.value); 
show = !hide;`,
    `show = ["AU"].includes(row.bankensLand.value);`,
    `show = ["CA"].includes(row.bankensLand.value);`,
    `show = ["US"].includes(row.bankensLand.value);`,
    `show = ["IN"].includes(row.bankensLand.value);`,
    `show = !["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.bankensLand.value);`,
    `show = !_.some(data.opplysningerOmBarn, (row) => { 

return row.hvemErForeldreTilBarnet === "jegOgAvdode"; 

});`,
  ],
  nav180405: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvorforSokerDuOmBarnepensjonEtterFylte18Ar.jegErLaerling === true)
    || (data.hvorforSokerDuOmBarnepensjonEtterFylte18Ar.jegHarPraksisplassEllerErPraktikant === true)
    || (data.harDuLonnsinntekt === "ja")
    ;`,
  ],
  nav190105: [
    `show = (data.hvaErDinSivilstand === "samboer") 
    || (data.hvaErDinSivilstand === "giftEllerPartner")
    || (data.hvaErDinSivilstand === "separert");`,
    `show = (data.hvaErDinSivilstand === "samboer") || 
       (data.hvaErDinSivilstand === "giftEllerPartner");`,
    `show = (data.harDuBoddEllerArbeidetUtenforNorgeEtterFylte16ArGjelderIkkeFerieopphold2 === "ja")
    && (data["borDuIUtlandetNa1"] === "nei");`,
    `show = (data.harDuBoddEllerArbeidetUtenforNorgeEtterFylte16ArGjelderIkkeFerieopphold2 === "ja")
    && (data["borDuIUtlandetNa1"] === "ja");`,
    `show = utils.isBornBeforeYear(1964, 'fodselsdatoDdMmAaaaSoker', submission);`,
    `show = (data.borDuIUtlandetNa1 === "ja") && 
       (data.harDinEktefellePartnerEllerNorskFodselsnummer === "nei");`,
    `show = (data.borDuINorge === "nei") && 
       (data.erDuNorskStatsborger === "nei");`,
  ],
  nav230301: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `var hide = (data.bolig === true)
        || (data.bil === true)
        || (data.andreNaturalytelser === true)
; 
show = !hide;`,
    `show = (data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegHarFullmakt") ||
       (data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegRepresentererEnVirksomhetMedFullmakt");`,
  ],
  nav310002: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.erDuIArbeidNa === "iFulltArbeid") || 
       (data.erDuIArbeidNa === "iDelvisArbeid");`,
    `show = (data.erDuIArbeidNa === "iFulltArbeid") || 
       (data.erDuIArbeidNa === "iDelvisArbeid");`,
    `show = (data.erDuIArbeidNa === "iDelvisArbeid") || 
       (data.erDuIArbeidNa === "ikkeIArbeid");`,
    `show = _.some(data.barnUnder21ArSomDuForsorger, (row) => { 

return row.erBarnetOver18Ar === "ja"; 

});`,
  ],
  nav310003: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = _.some(data.barnUnder21ArSomDuForsorger, (row) => { 

return row.erBarnetOver18Ar === "ja"; 

});`,
  ],
  nav330007: [
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
| (data.hvemErDuSomSoker === "institusjon")
|| (data.hvemErDuSomSoker === "verge")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = (data.hvemErDuSomSoker === "fosterforelder") ||
	(data.hvemErDuSomSoker === "annenOmsorgsperson")
	;`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "verge")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = (data.hvemErDuSomSoker === "forelder")
    || (data.hvemErDuSomSoker === "forsterforelder")
    || (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemErDuSomSoker === "forelder")
    || (data.hvemErDuSomSoker === "forsterforelder")
    || (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = (data.hvemErDuSomSoker === "institusjon")
    || (data.hvemErDuSomSoker === "verge");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
|| (data.hvaErBarnetsBosituasjon === "borAleneIEgenLeilighet")
;`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = ((data.hvemErDuSomSoker === "forelder")) &&
  (data.vilDuSokeOmUtvidetBarnetrygdITilleggTilOrdinaerBarnetrygd === "ja");`,
    `show = (data.hvaErBarnetsBosituasjon === "borAleneIEgenLeilighet");`,
    `show = (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErSeparert")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErSkilt")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErDod")
;`,
    `show = (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "bruddISamboerforhold")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErGiftMenDetErBruddIForholdet")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErIForvaring")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErForsvunnet")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErITvungetPsykiskHelsevern")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "annenArsak")
;`,
    `show = (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErSeparert")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErSkilt")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "bruddISamboerforhold")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegHarBoddAleneEtterAtJegFikkBarn")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErDod")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErIVaretektEllerFengsel")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErGiftMenDetErBruddIForholdet")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErIForvaring")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErForsvunnet")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErITvungetPsykiskHelsevern")
|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "annenArsak")
;`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = (row.hvaBeskriverPeriodenDuOppholdtDegUtenforNorgeBest === "jegOppholderMegUtenforNorgeNa")
    && (row.jegVetIkkeNarOppholdetAvsluttes1 !== true);`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDuI.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDuI.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDuI.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDuI1.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDuI1.value);`,
    `show = (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDuI1.value))
   &&
     (row.jegVetIkkeNarArbeidsperiodenAvsluttes1 !== true)
 ;`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDuI1.value)
 && (row.erArbeidsperiodenAvsluttet === "nei");`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFarDuPensjonenFra1.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFikkDuPensjonenFra.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFikkDuPensjonenFra.value);`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = (row.jegKanIkkeGiOpplysningerOmDenAndreForelderen1 !== true)
    && (row.jegKjennerIkkeFodselsnummerEllerDNummer !== true);`,
    `show = (row.borDenAndreForelderenINorge === "nei")
    && (row.jegVetIkkeHvilketLandDenAndreForelderenBorI !== true);`,
    `show = (data.hvemErDuSomSoker === "forelder")
    || (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = (data.hvemErDuSomSoker === "forelder")
    || (data.hvemErDuSomSoker === "annenOmsorgsperson");`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 

return row.harBarnetOppholdtSegSammenhengendeINorgeDeSisteTolvManedene === "nei"; 

});`,
    `show = (row.hvaBeskriverPeriodenBarnetOppholdtSegUtenforNorgeBest === "barnetOppholderSegUtenforNorgeNa")
    && (row.jegVetIkkeNarOppholdetAvsluttes !== true);`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 

return row.arbeiderEllerHarDenAndreForelderenTilBarnetArbeidetUtenforNorgePaUtenlandskSkipEllerPaUtenlandskKontinentalsokkel === "ja"; 

});`,
    `show = (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDenAndreForelderenI.value))
    ||
(["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDenAndreForelderenI.value)) ;`,
    `show = (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDenAndreForelderenI.value))
    ||
(["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDenAndreForelderenI.value)) ;`,
    `show = (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDenAndreForelderenI.value))`,
    `show = (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDenAndreForelderenI.value))
   &&
     (row.jegVetIkkeNarArbeidsperiodenAvsluttes !== true)
   ;`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDenAndreForelderenI.value);`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 
return row.farEllerHarDenAndreForelderenPensjonFraUtlandet === "ja"; 
});`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFarDenAndreForelderenPensjonFra1.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFikkDenAndreForelderenPensjonFra1.value);`,
    `show = ["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFikkDenAndreForelderenPensjonFra1.value);`,
    `show = (row.erArbeidsperiodenAvsluttet1 === "nei")
    && (row.jegVetIkkeNarArbeidsperiodenAvsluttes !== true);`,
    `show = (row.farDuUtbetalingerNa1 === "ja")
    && (row.jegVetIkkeNarUtbetalingeneStopper !== true);`,
    `show = (row.erArbeidsperiodenAvsluttetDenAndreForelderen === "ja") ||
(row.erArbeidsperiodenAvsluttetDenAndreForelderen === "nei");`,
    `show = (row.erArbeidsperiodenAvsluttetDenAndreForelderen === "ja");`,
    `show = (row.erArbeidsperiodenAvsluttetDenAndreForelderen === "nei");`,
    `show = (row.farDenAndreForelderenPensjonNa === "ja");`,
    `show = (row.farDenAndreForelderenPensjonNa === "nei");`,
    `show = (row.farDenAndreForelderenPensjonNa === "nei");`,
    `show = (row.erArbeidsperiodenAvsluttetOmsorgsperson === "ja") ||
(row.erArbeidsperiodenAvsluttetOmsorgsperson === "nei");`,
    `show = (row.erArbeidsperiodenAvsluttetOmsorgsperson === "ja");`,
    `show = (row.erArbeidsperiodenAvsluttetOmsorgsperson === "nei");`,
    `show = (row.erArbeidsperiodenAvsluttetOmsorgsperson === "nei");`,
    `show = (row.farAnnenOmsorgspersonPensjonNa === "ja");`,
    `show = (row.farAnnenOmsorgspersonPensjonNa === "nei");`,
    `show = (row.farAnnenOmsorgspersonPensjonNa === "nei");`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "institusjon")
|| (data.hvemErDuSomSoker === "verge")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = (data.hvemErDuSomSoker === "forelder")
|| (data.hvemErDuSomSoker === "fosterforelder")
|| (data.hvemErDuSomSoker === "institusjon")
|| (data.hvemErDuSomSoker === "verge")
|| (data.hvemErDuSomSoker === "annenOmsorgsperson")
;`,
    `show = (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErSeparert")
    || (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "jegErSkilt");`,
    `show = (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErIVaretektEllerFengsel")
	|| (data.hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 === "ektefellenSamboerenMinErIForvaring");`,
    `show = (_.some(data.leggTilUtenlandsopphold, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFlyttetDuFra1.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandHarDuFlyttetTil.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandOppholderDuDegI.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandOppholdtDuDegI.value)); 

}))

||
(_.some(data.leggTilArbeidsperiodeUtenforNorge2, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDuI.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDuI1.value));
}))
||
(_.some(data.leggTilPeriodeMedPensjonFraUtlandet1, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFarDuPensjonenFra1.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFikkDuPensjonenFra.value));
}))
||
(_.some(data.barnsOppholdIUtlandet, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFlyttetBarnetFra.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFlyttetBarnetTil.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandOppholderBarnetSegI.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandOppholdtBarnetSegI.value)); 

}))
||
(_.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.iHvilketLandBorDenAndreForelderenTilDetteBarnet.value))
|| (row.farDuEllerHarDuFattBarnetrygdForBarnetFraEtAnnetEosLand === "ja")
|| (row.farEllerHarDenAndreForelderenFattBarnetrygdForDetteBarnetFraEtAnnetEosLand === "ja");
}))
||
(_.some(data.leggTilArbeidsperiodeUtenforNorgeDenAndreForelderen, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeidetDenAndreForelderenI.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandArbeiderDenAndreForelderenI.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.arbeidsland.value));
}))
||
(_.some(data.leggTilPeriodeMedPensjonFraUtlandetDenAndreForelderen, (row) => { 

return (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFarDenAndreForelderenPensjonFra1.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.hvilketLandFikkDenAndreForelderenPensjonFra1.value))
|| (["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(row.pensjonsland.value));
}))
;`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 
return row.harDuOgDenAndreForelderenSkriftligAvtaleOmDeltBostedForBarnet1 === "ja"; 
});`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => {
return row.erDetSoktOmAsylINorgeForBarnet === "ja";
});`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 
return row.erBarnetFosterbarn === "ja"; 
}) ||
(data.hvemErDuSomSoker === "fosterforelder")
;`,
    `show = _.some(data.opplysningerOmBarnetDuSokerBarnetrygdFor, (row) => { 
return row.erBarnetAdoptertFraUtlandet === "ja"; 
});`,
  ],
  nav341601: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav361801: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav520501: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorgeX === "nei" || (row.adresse.borDuINorgeX === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvilkenPartErDuISaken === "forelderSomMottarBarnebidrag")
	|| (data.hvilkenPartErDuISaken === "forelderSomBetalerBarnebidrag")
	;`,
    `show = (data.hvilkenPartErDuISaken === "forelderSomMottarBarnebidrag")
    && (row.navaerendeBidragErFastsattVed === "privatAvtale") 
    && (row.onskerDuInnkrevingTilbakeITid === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "forelderSomMottarBarnebidrag")
    && ((row.navaerendeBidragErFastsattVed === "nav") 
    || (row.navaerendeBidragErFastsattVed === "rettsforlik") 
    || (row.navaerendeBidragErFastsattVed === "dom")) 
    && (row.onskerDuInnkrevingTilbakeITid === "ja");`,
    `show = (row.harDuFattBarnebidragetIHenholdTilAvtalenTilbakeITid === "jegHarFattNoe")
   || (row.harDuFattBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jegHarFattNoe");`,
    `show = (data.hvilkenPartErDuISaken === "forelderSomBetalerBarnebidrag")
    && (row.navaerendeBidragErFastsattVed === "privatAvtale") 
    && (row.onskerDuInnkrevingTilbakeITid === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "forelderSomBetalerBarnebidrag")
    && ((row.navaerendeBidragErFastsattVed === "nav") 
    || (row.navaerendeBidragErFastsattVed === "rettsforlik") 
    || (row.navaerendeBidragErFastsattVed === "dom")) 
    && (row.onskerDuInnkrevingTilbakeITid === "ja");`,
    `show = (row.harDuBetaltBarnebidragetIHenholdTilAvtalenTilbakeITid === "jegHarBetaltNoe")
   || (row.harDuBetaltBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jegHarBetaltNoe")
   || (row.harDuBetaltBarnebidragetIHenholdTilAvtalenTilbakeITid === "jaISinHelhelt")
   || (row.harDuBetaltBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jaISinHelhelt");`,
    `show = (row.harDuBetaltBarnebidragetIHenholdTilAvtalenTilbakeITid === "jegHarBetaltNoe")
   || (row.harDuBetaltBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jegHarBetaltNoe");`,
    `show = (data.navaerendeBidragErFastsattVed === "privatAvtale") 
    && (data.onskerDuInnkrevingTilbakeITid === "ja");`,
    `show = ((data.navaerendeBidragErFastsattVed === "nav") 
    || (data.navaerendeBidragErFastsattVed === "rettsforlik") 
    || (data.navaerendeBidragErFastsattVed === "dom")) 
    && (data.onskerDuInnkrevingTilbakeITid === "ja");`,
    `show = (data.harDuFattBarnebidragetIHenholdTilAvtalenTilbakeITid === "jegHarFattNoe")
   || (data.harDuFattBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jegHarFattNoe");`,
    `show = (data.navaerendeBidragErFastsattVed === "privatAvtale")

||

(_.some(data.opplysningerOmBarnDuBerOmInnkrevingFor, (row) => { 

return row.navaerendeBidragErFastsattVed === "privatAvtale"; 

}));`,
    `show = (data.navaerendeBidragErFastsattVed === "rettsforlik")

||

(_.some(data.opplysningerOmBarnDuBerOmInnkrevingFor, (row) => { 

return row.navaerendeBidragErFastsattVed === "rettsforlik"; 

}));`,
    `show = (data.navaerendeBidragErFastsattVed === "dom")

||

(_.some(data.opplysningerOmBarnDuBerOmInnkrevingFor, (row) => { 

return row.navaerendeBidragErFastsattVed === "dom"; 

}));`,
    `show = (_.some(data.opplysningerOmBarnDuBerOmInnkrevingFor, (row) => { 
return (row.harDuBetaltBarnebidragetIHenholdTilAvtalenTilbakeITid === "jegHarBetaltNoe")
   || (row.harDuBetaltBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jegHarBetaltNoe")
   || (row.harDuBetaltBarnebidragetIHenholdTilAvtalenTilbakeITid === "jaISinHelhelt")
   || (row.harDuBetaltBarnebidragetIHenholdTilFastsettelsenTilbakeITid === "jaISinHelhelt");
}))
;`,
  ],
  nav530005: [
    `show = (data.kravetGjelder2 === "fastsettelse");`,
    `show = (data.kravetGjelder2 === "endring");`,
    `show = (data.fastsettelseAvBidrag.utbetalingAvBidragFraDato === true) || (data.endringAvBidrag.utbetalingAvBidragFraDato === true);`,
    `show = (data.fastsettelseAvBidrag.bidragetsStorrelsePerManed === true) || (data.endringAvBidrag.bidragetsStorrelsePerManed === true);`,
    `show = (data.fastsettelseAvBidrag.utbetalingAvBidragTilDato === true) || (data.endringAvBidrag.utbetalingAvBidragTilDato === true);`,
    `show = (data.kravetGjelder2 === "innkreving")  && (data.hvilkenPartErDuISaken === "bidragsmottager");`,
    `show = (data.kravetGjelder2 === "opphor") && (data.hvilkenPartErDuISaken === "bidragsgiver");`,
    `show = 
(data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden !== "nei") && 
(data.kravetGjelder2 === "endring");`,
    `show = (data.borDuINorge === "ja") && (data.harDuNorskFodselsnummerEllerDNummer === "nei");`,
    `show = (data.borDuINorge === "nei") && (data.harDuNorskFodselsnummerEllerDNummer === "nei");`,
    `show = (data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") && (data.borMotpartenINorge === "ja");`,
    `show = (data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") && (data.borMotpartenINorge === "nei");`,
    `show = (data.borMotpartenINorge === "ja");`,
    `show=(data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden === "ja") && ((data.kravetGjelder2 === "fastsettelse") || (data.kravetGjelder2 === "endring"));`,
    `show=(data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden === "ja") && (data.kravetGjelder2 != "innkreving");`,
    `show= (data.erDereFormeltSeparert === "ja");`,
    `show=(data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden === "ja") && (data.kravetGjelder2 != "innkreving");`,
    `show=(data.erDereFormeltSkilt === "ja");`,
    `show = (data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden !== "nei") && (data.kravetGjelder2 !== "innkreving")&& (data.kravetGjelder2 !== "opphor");`,
    `show = (data.harDuUtdanningUtoverVanligGrunnskole === "ja");`,
    `show = (data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden !== "nei") && (data.kravetGjelder2 !== "innkreving")&& (data.kravetGjelder2 !== "opphor");`,
    `show=(data.harParteneFellesBarn === "ja");`,
    `show = (data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden !== "nei") && (data.kravetGjelder2 !== "innkreving")&& (data.kravetGjelder2 !== "opphor");`,
    `show=(data.harDuNyEktefelleSamboer === "jaNyEktefelle");`,
    `show=(data.harDuNyEktefelleSamboer === "jaSamboer");`,
    `show=(data.harDuForsorgedeSaerkullsbarn === "ja");`,
    `show = (data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden != "nei") && (data.kravetGjelder2 != "innkreving") && (data.kravetGjelder2 != "opphor");`,
    `show = (data.samtykkerDuIAtKravetAvgjoresAvBidragsfogden != "nei") && (data.kravetGjelder2 != "innkreving")&& (data.kravetGjelder2 != "opphor");`,
    `show=(data.harDuUtdanningUtoverVanligGrunnskole === "ja");`,
    `show=(data.kravetGjelder2 === "endring");`,
  ],
  nav540004: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.ettBarn.harDuTilsynsordningForBarnet === "ja")
    ||
(_.some(data.opplysningerOmBarn, (row) => {  

  return (row.harDuTilsynsordningForBarnet === "ja"); 
}));`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
    || (data.skalDuSokeOmDetSammeForAlleBarnaSoknadenGjelder === "ja");`,
    `show = (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (row.sokerDuTilbakeITid === "ja");`,
    `show = (row.hvaSokerDuOm === "endringAvBarnebidrag")
    && (row.sokerDuTilbakeITid === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (row.sokerDuTilbakeITid === "ja")
    && (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && (row.sokerDuTilbakeITid === "ja")
    && (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
    && (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn"))
    || (data.erDetEndringIBarnetsBosted1 === "ja"));`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
    && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIBarnetsBosted1 === "ja"));`,
    `show = (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
    || (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    && ((data.erDetEndringIBarnetsBosted1 === "nei")
    || (data.harBarnetDeltFastBosted === "nei"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  && (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
   && (data.harBarnetDeltFastBosted === "nei"))
   || (data.erDetEndringISamvaeretKunEttBarn === "ja"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
  && (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
   && (data.harBarnetDeltFastBosted === "nei"))
   || (data.erDetEndringISamvaeretKunEttBarn === "ja"));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
   ||
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && (data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (((data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja")
    && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))))
    || (data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "ja"));`,
    `show =((data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja")
    && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))))
    || (data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "ja");`,
    `show = (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "nei")
    || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "vetIkke");`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && ((data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "nei")
    || (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "nei"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "nei"))
  || (data.flereBarnISammeSoknad.erDetEndringISamvaeret === "ja"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "nei"))
  || (data.flereBarnISammeSoknad.erDetEndringISamvaeret === "ja"));`,
    `show = (data.erDetAvtaltEllerFastsattAtDuSkalHaSamvaerMedBarnet === "ja") 
    || (data.erDetAvtaltEllerFastsattAtDenBidragspliktigeSkalHaSamvaerMedBarnet === "ja")
    || (data.flereBarnISammeSoknad.erDetAvtaltEllerFastsattAtDuSkalHaSamvaerMedBarna === "ja") 
    || (data.flereBarnISammeSoknad.erDetAvtaltEllerFastsattAtDenBidragspliktigeSkalHaSamvaerMedBarna === "ja");`,
    `show = (data.harNavMottattSamvaersavtalenTidligereIDenneSaken1 === "nei")
    || (data.harNavMottattSamvaersavtalenTidligereIDenneSaken1 === "vetIkke");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForFlereBarnSomErISammeKull");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForFlereBarnSomErISammeKull");`,
    `show = (data.harBarnetSamvaerIFerier === "ja")
    || (data.harBarnaSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja")
    || (data.harDuSamvaerMedBarnaIFerier === "ja");`,
    `show = (data.samvaeretErAvtaltFastsattVed === "skriftligAvtale") ||
       (data.samvaeretErAvtaltFastsattVed === "muntligAvtale");`,
    `show = (data.samvaeretErAvtaltFastsattVed === "dom") ||
       (data.samvaeretErAvtaltFastsattVed === "rettsforlik");`,
    `show = (data.gjennomforesSamvaeretSlikDetErAvtalt === "nei") ||
       (data.gjennomforesSamvaeretSlikDetErFastsatt === "nei");`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})));`,
    `show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  &&  (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
    || (row.erDetEndringIDetteBarnetsBosted === "ja"));`,
    `show =(((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))))
    || (row.erDetEndringIDetteBarnetsBosted === "ja");`,
    `show = (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
    || (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke");`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && ((row.erDetEndringIDetteBarnetsBosted === "nei")
    || (row.harBarnetDeltFastBosted1 === "nei"));`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && ((row.erDetEndringIDetteBarnetsBosted === "nei")
    || (row.harBarnetDeltFastBosted1 === "nei"));

show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (row.harBarnetDeltFastBosted1 === "nei"))
  || (row.erDetEndringISamvaeretForDetteBarnet === "ja"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (row.harBarnetDeltFastBosted1 === "nei"))
  || (row.erDetEndringISamvaeretForDetteBarnet === "ja"));`,
    `show = (row.erDetAvtaltFastsattAtDuSkalHaSamvaerMedBarnet === "ja") ||
       (row.erDetAvtaltFastsattAtDenBidragspliktigeSkalHaSamvaerMedBarnet === "ja");`,
    `show = (row.harNavMottattSamvaersavtalenTidligereIDenneSaken === "nei")
    || (row.harNavMottattSamvaersavtalenTidligereIDenneSaken === "vetIkke");`,
    `show = (row.harBarnetSamvaerIFerier1 === "ja")
    || (row.harDuSamvaerMedBarnetIFerier1 === "ja");`,
    `show = (row.samvaeretErAvtaltEllerFastsattVed === "skriftligAvtale") ||
       (row.samvaeretErAvtaltEllerFastsattVed === "muntligAvtale");`,
    `show = (row.samvaeretErAvtaltEllerFastsattVed === "dom") ||
       (row.samvaeretErAvtaltEllerFastsattVed === "rettsforlik");`,
    `show = (row.gjennomforesSamvaeretSlikDetErAvtalt === "nei") ||
       (row.gjennomforesSamvaeretSlikDetErFastsatt === "nei");`,
    `show = (data.harBarnetSamvaerIFerier === "ja")
    || (data.harBarnaSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja")
    || (data.harDuSamvaerMedBarnaIFerier === "ja")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.harBarnetSamvaerIFerier1 === "ja")
    || (row.harDuSamvaerMedBarnetIFerier1 === "ja");
}));`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
     || (data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja");`,
    `var hide = (data.ferieJulOgNyttar1 === true)
        || (data.vinterferie1 === true)
        || (data.paskeferie1 === true)
        || (data.sommerferie1 === true)
        || (data.hostferie1 === true)
        || (data.annetSamvaer1 === true)
; 
show = !hide;`,
    `var hide = (row.ferieJulOgNyttar === true)
        || (row.vinterferie === true)
        || (row.paskeferie === true)
        || (row.sommerferie === true)
        || (row.hostferie === true)
        || (row.annetSamvaer === true)
; 
show = !hide;`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    &&
    ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => { 

return row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"; 

})));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => { 

return row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"; 

}));`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 1)
    && (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg < 100);`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 2)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 3)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 4)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 5)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.kunEttBarn.harDuEnAvtaleOmBarnebidragForDetBarnetDetErSoktFor === "ja");`,
    `show = (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
       (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.kunEttBarn.bidragetErFastsattVed === "privatAvtale") ||
       (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
       (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.kunEttBarn.bidragetErFastsattVed === "privatAvtale") ||
       (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
       (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.kunEttBarn.oppgiAvtaleform === "skriftlig")
    || (data.kunEttBarn.bidragetErFastsattVed === "nav")
    || (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik")
    || (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && ((data.kunEttBarn.oppgiAvtaleform === "muntlig") 
    || ((data.kunEttBarn.oppgiAvtaleform === "skriftlig")
    &&  (data.kunEttBarn.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show=

((data.kunEttBarn.bidragetErFastsattVed === "nav") ||
(data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
(data.kunEttBarn.bidragetErFastsattVed === "dom")) &&
(data.hvilkenPartErDuISaken === "bidragsmottakerForelder") &&
(data.kunEttBarn.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = (data.kunEttBarn.harDuFattBarnebidragetIHenholdTilAvtalen === "jegHarFattNoe")
    || (data.kunEttBarn.harDuFattBarnebidragetIHenholdTilFastsettelsen === "jegHarFattNoe");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && ((data.kunEttBarn.oppgiAvtaleform === "muntlig") 
    || ((data.kunEttBarn.oppgiAvtaleform === "skriftlig")
    &&  (data.kunEttBarn.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show=
((data.kunEttBarn.bidragetErFastsattVed === "nav") ||
(data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
(data.kunEttBarn.bidragetErFastsattVed === "dom")) &&
(data.hvilkenPartErDuISaken === "bidragspliktigeForelder") &&
(data.kunEttBarn.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = (data.kunEttBarn.harDuBetaltBidragetIHenholdTilAvtalen === "harBetaltNoe")
    || (data.kunEttBarn.harDuBetaltBidragetIHenholdTilFastsettelsen === "harBetaltNoe");`,
    `show = (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken1 === "nei")
    || (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken1 === "vetIkke");`,
    `show = (row.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
    || (row.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.bidragetErFastsattVed === "privatAvtale") ||
       (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.bidragetErFastsattVed === "privatAvtale") ||
       (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.oppgiAvtaleform === "skriftlig")
    || (row.bidragetErFastsattVed === "nav")
    || (row.bidragetErFastsattVed === "rettsforlik")
    || (row.bidragetErFastsattVed === "dom");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && ((row.oppgiAvtaleform === "muntlig") 
    || ((row.oppgiAvtaleform === "skriftlig")
    &&  (row.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show=
((row.bidragetErFastsattVed === "nav") ||
(row.bidragetErFastsattVed === "rettsforlik") ||
(row.bidragetErFastsattVed === "dom")) &&
(data.hvilkenPartErDuISaken === "bidragsmottakerForelder") &&
(row.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = (row.harDuFattBarnebidragetIHenholdTilAvtalen === "jegHarFattNoe")
    || (row.harDuFattBarnebidragetIhenholdTilFastsettelsen === "jegHarFattNoe");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && ((row.oppgiAvtaleform === "muntlig") 
    || ((row.oppgiAvtaleform === "skriftlig")
    &&  (row.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show=
((row.bidragetErFastsattVed === "nav") ||
(row.bidragetErFastsattVed === "rettsforlik") ||
(row.bidragetErFastsattVed === "dom")) &&
(data.hvilkenPartErDuISaken === "bidragspliktigeForelder") &&
(row.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = (row.harDuBetaltBidragetIHenholdTilAvtalen === "jegHarBetaltNoe")
    || (row.harDuBetaltBidragetIHenholdTilFastsettelsen === "jegHarBetaltNoe");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    ||
data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})
    || (data.vedEndring.erDetEndringIDinJobb === "ja");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    ||
data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})
    || (data.kunVedEndring.erDetEndringIInntektenDin === "ja");`,
    `show = (data.harDuSkattepliktigInntektINorge === "ja")
    || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge");`,
    `show = (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
    || (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke")
    || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "nei")
    || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "vetIkke") 
    ||      (_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {  
  return (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
      || (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke");
      }));`,
    `show = (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke")
    ||
(_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => {
  return (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken1 === "nei")
      || (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken1 === "vetIkke");
}));`,
    `show = (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke")
    ||
(_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => {
  return (row.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
      || (row.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke");
}));`,
    `show = (data.kunEttBarn.erDommenSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erDommenSendtInnTidligereIDenneSaken === "vetIkke")
    ||
(_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => {
  return (row.erDommenSendtInnTidligereIDenneSaken === "nei")
      || (row.erDommenSendtInnTidligereIDenneSaken === "vetIkke");
}));`,
    `show = (data.harNavMottattSamvaersavtalenTidligereIDenneSaken1 === "nei")
    || (data.harNavMottattSamvaersavtalenTidligereIDenneSaken1 === "vetIkke")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (rad) => {
  return (rad.harNavMottattSamvaersavtalenTidligereIDenneSaken === "nei")
      || (rad.harNavMottattSamvaersavtalenTidligereIDenneSaken === "vetIkke");
}));`,
    `show = (data.samvaeretErAvtaltFastsattVed === "dom")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.samvaeretErAvtaltEllerFastsattVed === "dom");
}));`,
    `show = (data.samvaeretErAvtaltFastsattVed === "rettsforlik")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.samvaeretErAvtaltEllerFastsattVed === "rettsforlik");
}));`,
    `show = (data.ettBarn.harNavMottattDokumentasjonPaKostnadeneForTilsynsordningenIDenneSaken === "nei")
    ||
(_.some(data.opplysningerOmBarn, (row) => {  

  return (row.harNavMottattDokumentasjonPaKostnadeneForTilsynsordningenIDenneSaken === "nei"); 
}));`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.ettBarn.harNavMottattBekreftelseFraBarnevernetEllerInstitusjonenOmForsorgelseIDenneSaken === "nei")
    ||
(_.some(data.opplysningerOmBarn, (row) => { 
return row.harNavMottattBekreftelseFraBarnevernetEllerInstitusjonenOmForsorgelseIDenneSaken === "nei"; 
}));`,
  ],
  nav540005: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.ettBarn.harDuTilsynsordningForBarnet === "ja")
    ||
(_.some(data.opplysningerOmBarn, (row) => {  

  return (row.harDuTilsynsordningForBarnet === "ja"); 
}));`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
    || (data.skalDuSokeOmDetSammeForAlleBarnaSoknadenGjelder === "ja");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (data.hvilkenPartErDuISaken === "bidragsmottakerForelder");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (data.hvilkenPartErDuISaken === "bidragspliktigeForelder");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (data.hvilkenPartErDuISaken === "bidragsmottakerForelder");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (data.hvilkenPartErDuISaken === "bidragspliktigeForelder");`,
    `show = (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (row.sokerDuTilbakeITid === "ja")
    && (data.hvilkenPartErDuISaken === "bidragsmottakerForelder");`,
    `show = (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (row.sokerDuTilbakeITid === "ja")
    && (data.hvilkenPartErDuISaken === "bidragspliktigeForelder");`,
    `show = (row.hvaSokerDuOm === "endringAvBarnebidrag")
    && (row.sokerDuTilbakeITid === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (row.sokerDuTilbakeITid === "ja")
    && (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && (row.sokerDuTilbakeITid === "ja")
    && (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
    && (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn"))
    || (data.erDetEndringIBarnetsBosted1 === "ja"));`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
    && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIBarnetsBosted1 === "ja"));`,
    `show = (data.erDetEndringIBarnetsBosted1 === "ja")
    && (data.harBarnetDeltFastBosted === "ja");`,
    `show = ((data.harBarnetDeltFastBosted=== "ja")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"))
    || (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
    || (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    && ((data.erDetEndringIBarnetsBosted1 === "nei")
    || (data.harBarnetDeltFastBosted === "nei"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  && (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
   && (data.harBarnetDeltFastBosted === "nei"))
   || (data.erDetEndringISamvaeretKunEttBarn === "ja"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
  && (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
   && (data.harBarnetDeltFastBosted === "nei"))
   || (data.erDetEndringISamvaeretKunEttBarn === "ja"));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}));`,
    `var hide = 
_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})
show = !hide;`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || ((data.skalDuSokeOmDetSammeForAlleBarnaSoknadenGjelder === "nei")
    &&
_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && (data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (((data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja")
    && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))))
    || (data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "ja"));`,
    `show =((data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja")
    && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))))
    || (data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "ja");`,
    `show = (data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "ja")
    && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "ja");`,
    `show = ((data.flereBarnISammeSoknad.erDetEndringIBarnasBosted !== "ja")
     && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "ja"))
     || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "nei")
     || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "vetIkke");`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && ((data.flereBarnISammeSoknad.erDetEndringIBarnasBosted === "nei")
    || (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "nei"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "nei"))
  || (data.flereBarnISammeSoknad.erDetEndringISamvaeret === "ja"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "nei"))
  || (data.flereBarnISammeSoknad.erDetEndringISamvaeret === "ja"));`,
    `show = (data.erDetAvtaltEllerFastsattAtDuSkalHaSamvaerMedBarnet === "ja") 
    || (data.erDetAvtaltEllerFastsattAtDenBidragspliktigeSkalHaSamvaerMedBarnet === "ja")
    || (data.flereBarnISammeSoknad.erDetAvtaltEllerFastsattAtDuSkalHaSamvaerMedBarna === "ja") 
    || (data.flereBarnISammeSoknad.erDetAvtaltEllerFastsattAtDenBidragspliktigeSkalHaSamvaerMedBarna === "ja");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForFlereBarnSomErISammeKull");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForFlereBarnSomErISammeKull");`,
    `show = (data.harBarnetSamvaerIFerier === "ja")
    || (data.harBarnaSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja")
    || (data.harDuSamvaerMedBarnaIFerier === "ja");`,
    `show = (data.samvaeretErAvtaltFastsattVed === "skriftligAvtale") ||
       (data.samvaeretErAvtaltFastsattVed === "muntligAvtale");`,
    `show = (data.samvaeretErAvtaltFastsattVed === "dom") ||
       (data.samvaeretErAvtaltFastsattVed === "rettsforlik");`,
    `show = (data.gjennomforesSamvaeretSlikDetErAvtalt === "nei") ||
       (data.gjennomforesSamvaeretSlikDetErFastsatt === "nei");`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})));`,
    `show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  &&  (((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
    || (row.erDetEndringIDetteBarnetsBosted === "ja"));`,
    `show =(((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))))
    || (row.erDetEndringIDetteBarnetsBosted === "ja");`,
    `show = (row.erDetEndringIDetteBarnetsBosted === "ja")
    && (row.harBarnetDeltFastBosted1 === "ja");`,
    `show = ((row.erDetEndringIDetteBarnetsBosted !== "ja")
      && (row.harBarnetDeltFastBosted1 === "ja"))
    || (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken  === "nei")
    || (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken  === "vetIkke");`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && ((row.erDetEndringIDetteBarnetsBosted === "nei")
    || (row.harBarnetDeltFastBosted1 === "nei"));`,
    `show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
})))
    && ((row.erDetEndringIDetteBarnetsBosted === "nei")
    || (row.harBarnetDeltFastBosted1 === "nei"));

show= (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (row.harBarnetDeltFastBosted1 === "nei"))
  || (row.erDetEndringISamvaeretForDetteBarnet === "ja"));`,
    `show= (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
  && ((((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
  || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})))
  && (row.harBarnetDeltFastBosted1 === "nei"))
  || (row.erDetEndringISamvaeretForDetteBarnet === "ja"));`,
    `show = (row.erDetAvtaltFastsattAtDuSkalHaSamvaerMedBarnet === "ja") ||
       (row.erDetAvtaltFastsattAtDenBidragspliktigeSkalHaSamvaerMedBarnet === "ja");`,
    `show = (row.harBarnetSamvaerIFerier1 === "ja")
    || (row.harDuSamvaerMedBarnetIFerier1 === "ja");`,
    `show = (row.samvaeretErAvtaltEllerFastsattVed === "skriftligAvtale") ||
       (row.samvaeretErAvtaltEllerFastsattVed === "muntligAvtale");`,
    `show = (row.samvaeretErAvtaltEllerFastsattVed === "dom") ||
       (row.samvaeretErAvtaltEllerFastsattVed === "rettsforlik");`,
    `show = (row.gjennomforesSamvaeretSlikDetErAvtalt === "nei") ||
       (row.gjennomforesSamvaeretSlikDetErFastsatt === "nei");`,
    `show = (data.harBarnetSamvaerIFerier === "ja")
    || (data.harBarnaSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja")
    || (data.harDuSamvaerMedBarnaIFerier === "ja")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.harBarnetSamvaerIFerier1 === "ja")
    || (row.harDuSamvaerMedBarnetIFerier1 === "ja");
}));`,
    `show = (data.skalDuSokeForEttEllerFlereBarn === "jegSkalSokeForEttBarn")
     || (data.flereBarnISammeSoknad.harBarnaDuSokerForSammeBostedOgSammeOrdningForSamvaer === "ja");`,
    `var hide = (data.ferieJulOgNyttar1 === true)
        || (data.vinterferie1 === true)
        || (data.paskeferie1 === true)
        || (data.sommerferie1 === true)
        || (data.hostferie1 === true)
        || (data.annetSamvaer1 === true)
; 
show = !hide;`,
    `var hide = (row.ferieJulOgNyttar === true)
        || (row.vinterferie === true)
        || (row.paskeferie === true)
        || (row.sommerferie === true)
        || (row.hostferie === true)
        || (row.annetSamvaer === true)
; 
show = !hide;`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke");`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr") ||
(data.borMotpartenEtAnnetStedEnnDenAdressenVedkommendeErRegistrertMedIFolkeregisteret === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") ||
(data.borMotpartenINorge === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "nei");`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    &&
    ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => { 

return row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"; 

})));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => { 

return row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"; 

}));`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 1)
    && (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg < 100);`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 2)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 3)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 4)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 5)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.kunEttBarn.harDuEnAvtaleOmBarnebidragForDetBarnetDuSokerFor === "ja");`,
    `show = (data.kunEttBarn.harDuEnAvtaleOmBarnebidragForDetBarnetDuSokerFor !== "ja")
    && (data.kunEttBarn.oppgiAvtaleform === "skriftlig");`,
    `show = (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke") 
    ||  ((data.kunEttBarn.oppgiAvtaleform === "skriftlig")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"));`,
    `show = (data.kunEttBarn.harDuEnAvtaleOmBarnebidragForDetBarnetDuSokerFor !== "ja")
    && (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik");`,
    `show = (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke") 
    ||  ((data.kunEttBarn.bidragetErFastsattVed === "rettsforlik")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"));`,
    `show = (data.kunEttBarn.harDuEnAvtaleOmBarnebidragForDetBarnetDuSokerFor !== "ja")
    && (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.kunEttBarn.erDommenSendtInnTidligereIDenneSaken === "nei")
    || (data.kunEttBarn.erDommenSendtInnTidligereIDenneSaken === "vetIkke") 
    ||  ((data.kunEttBarn.bidragetErFastsattVed === "dom")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"));`,
    `show = (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
       (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.kunEttBarn.bidragetErFastsattVed === "privatAvtale") ||
       (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
       (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show = (data.kunEttBarn.bidragetErFastsattVed === "privatAvtale") ||
       (data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
       (data.kunEttBarn.bidragetErFastsattVed === "dom");`,
    `show=
(data.kunEttBarn.bidragetErFastsattVed === "privatAvtale") &&
(data.hvilkenPartErDuISaken === "bidragsmottakerForelder") &&
((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
     || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "neiViGjorOppPrivatOssIMellom"));`,
    `show=

((data.kunEttBarn.bidragetErFastsattVed === "nav") ||
(data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
(data.kunEttBarn.bidragetErFastsattVed === "dom")) &&
(data.hvilkenPartErDuISaken === "bidragsmottakerForelder") &&
((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
     || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "neiViGjorOppPrivatOssIMellom"));`,
    `show = (data.kunEttBarn.harDuFattBarnebidragetIHenholdTilAvtalen === "jegHarFattNoe")
    || (data.kunEttBarn.harDuFattBarnebidragetIHenholdTilFastsettelsen === "jegHarFattNoe");`,
    `show=
(data.kunEttBarn.bidragetErFastsattVed === "privatAvtale") &&
(data.hvilkenPartErDuISaken === "bidragspliktigeForelder") &&
((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
     || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "neiViGjorOppPrivatOssIMellom"));`,
    `show=
((data.kunEttBarn.bidragetErFastsattVed === "nav") ||
(data.kunEttBarn.bidragetErFastsattVed === "rettsforlik") ||
(data.kunEttBarn.bidragetErFastsattVed === "dom")) &&
(data.hvilkenPartErDuISaken === "bidragspliktigeForelder") &&
((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
     || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "neiViGjorOppPrivatOssIMellom"));`,
    `show = (data.kunEttBarn.harDuBetaltBidragetIHenholdTilAvtalen === "harBetaltNoe")
    || (data.kunEttBarn.harDuBetaltBidragetIHenholdTilFastsettelsen === "harBetaltNoe");`,
    `show =(data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
});`,
    `show = (row.harDuEnAvtaleOmBarnebidragForDetteBarnet === "ja")
   || (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
   ||
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (row.harDuEnAvtaleOmBarnebidragForDetteBarnet !== "ja")
    && (row.oppgiAvtaleform === "skriftlig");`,
    `show = (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke") 
    ||  ((row.oppgiAvtaleform === "skriftlig")
     && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
      || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))
));`,
    `show = (row.harDuEnAvtaleOmBarnebidragForDetteBarnet !== "ja")
    && (row.bidragetErFastsattVed === "rettsforlik");`,
    `show = (row.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
    || (row.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke") 
    ||  ((row.bidragetErFastsattVed === "rettsforlik")
     && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
      || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))
));`,
    `show = (row.harDuEnAvtaleOmBarnebidragForDetteBarnet !== "ja")
    && (row.bidragetErFastsattVed === "dom");`,
    `show = (row.erDommenSendtInnTidligereIDenneSaken === "nei")
    || (row.erDommenSendtInnTidligereIDenneSaken === "vetIkke") 
    ||  ((row.bidragetErFastsattVed === "dom")
     && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
      || (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))
));`,
    `show = (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.bidragetErFastsattVed === "privatAvtale") ||
       (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.bidragetErFastsattVed === "privatAvtale") ||
       (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (data.skalDuSokeOmDetSammeForAlleBarnaSoknadenGjelder === "nei")
   && ((row.oppgiAvtaleform === "skriftlig")
    || (row.bidragetErFastsattVed === "nav")
    || (row.bidragetErFastsattVed === "rettsforlik")
    || (row.bidragetErFastsattVed === "dom"));`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && ((row.oppgiAvtaleform === "muntlig")
    || 
       ((row.oppgiAvtaleform === "skriftlig")
    &&  ((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
      || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "neiViGjorOppPrivatOssIMellom")
      || (row.kreverSkatteetatenInnBarnebidraget === "nei"))));`,
    `show = (data.hvilkenPartErDuISaken === "bidragsmottakerForelder")
    && ((row.bidragetErFastsattVed === "nav")
    || (row.bidragetErFastsattVed === "rettsforlik")
    || (row.bidragetErFastsattVed === "dom"))
    && (((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
      || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "neiViGjorOppPrivatOssIMellom"))
      || (row.kreverSkatteetatenInnBarnebidraget === "nei"));`,
    `show = (row.harDuFattBarnebidragetIHenholdTilAvtalen === "jegHarFattNoe")
    || (row.harDuFattBarnebidragetIhenholdTilFastsettelsen === "jegHarFattNoe");`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && ((row.oppgiAvtaleform === "muntlig")
    || ((row.oppgiAvtaleform === "skriftlig")
    &&  ((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
      || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "neiViGjorOppPrivatOssIMellom")
      || (row.kreverSkatteetatenInnBarnebidraget === "nei"))));`,
    `show = (data.hvilkenPartErDuISaken === "bidragspliktigeForelder")
    && ((row.bidragetErFastsattVed === "nav")
    || (row.bidragetErFastsattVed === "rettsforlik")
    || (row.bidragetErFastsattVed === "dom"))
    && (((data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
      || (data.sokerForKunEttBarn.onskerDuAtSkatteetatenSkalKreveInnBarnebidragetFraDeg === "neiViGjorOppPrivatOssIMellom"))
      || (row.kreverSkatteetatenInnBarnebidraget === "nei"));`,
    `show = (row.harDuBetaltBidragetIHenholdTilAvtalen === "jegHarBetaltNoe")
    || (row.harDuBetaltBidragetIHenholdTilFastsettelsen === "jegHarBetaltNoe");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    ||
data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})
    || (data.vedEndring.erDetEndringIDinJobb === "ja");`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || 
(data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag")
    || 
(_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "endringAvBarnebidrag"); 
}));`,
    `show = (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    ||
data.detDuSokerOmForHvertAvBarna.length>0 && _.every(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
})
    || (data.kunVedEndring.erDetEndringIInntektenDin === "ja");`,
    `show = (data.harDuSkattepliktigInntektINorge === "ja")
    || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge");`,
    `show = (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
   
    || (data.kunEttBarn.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke") 
  
    ||  ((data.kunEttBarn.oppgiAvtaleform === "skriftlig")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"))
  
     ||
     (_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => {  

  return (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
      || (row.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke");
      })) 

    ||  
    (_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => { 

  return (row.oppgiAvtaleform === "skriftlig");
     })
     && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")   
     ||
 (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))));`,
    `show = (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
   
    || (data.kunEttBarn.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke") 
  
    ||  ((data.kunEttBarn.bidragetErFastsattVed === "rettsforlik")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"))
  
     ||
     (_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => {  

  return (row.erRettsforliketSendtInnTidligereIDenneSaken === "nei")
      || (row.erRettsforliketSendtInnTidligereIDenneSaken === "vetIkke");
      })) 

    ||  
    (_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => { 

  return (row.bidragetErFastsattVed === "rettsforlik");
     })
     && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")   
     ||
 (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))));`,
    `show = (data.kunEttBarn.erDommenSendtInnTidligereIDenneSaken === "nei")
   
    || (data.kunEttBarn.erDommenSendtInnTidligereIDenneSaken === "vetIkke") 
  
    ||  ((data.kunEttBarn.bidragetErFastsattVed === "dom")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"))
  
     ||
     (_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => {  

  return (row.erDommenSendtInnTidligereIDenneSaken === "nei")
      || (row.erDommenSendtInnTidligereIDenneSaken === "vetIkke");
      })) 

    ||  
    (_.some(data.omTidligereBidragsavtalerForHvertAvBarnaDuSokerFor, (row) => { 

  return (row.bidragetErFastsattVed === "dom");
     })
     && ((data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag")   
     ||
 (_.some(data.detDuSokerOmForHvertAvBarna, (row) => {  

  return (row.hvaSokerDuOm === "fastsettelseAvBarnebidrag"); 
}))));`,
    `show = (data.samvaeretErAvtaltFastsattVed === "skriftligAvtale")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.samvaeretErAvtaltEllerFastsattVed === "skriftligAvtale");
}));`,
    `show = (data.samvaeretErAvtaltFastsattVed === "dom")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.samvaeretErAvtaltEllerFastsattVed === "dom");
}));`,
    `show = (data.samvaeretErAvtaltFastsattVed === "rettsforlik")
    ||
(_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {
return (row.samvaeretErAvtaltEllerFastsattVed === "rettsforlik");
}));`,
    `show = (data.ettBarn.harDuTilsynsordningForBarnet === "ja")
    ||
(_.some(data.opplysningerOmBarn, (row) => {  

  return (row.harDuTilsynsordningForBarnet === "ja"); 
}));`,
    `show = (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
    || (data.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke")
    || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "nei")
    || (data.flereBarnISammeSoknad.harNavMottattAvtalenOmDeltFastBostedForBarnaIDenneSaken === "vetIkke") 
    ||      (_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => {  

  return (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei")
      || (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke");
      }))
  
    ||  ((data.harBarnetDeltFastBosted=== "ja")
     && (data.sokerForKunEttBarn.hvaSokerDuOm === "fastsettelseAvBarnebidrag"))
  
     || ((data.flereBarnISammeSoknad.erDetEndringIBarnasBosted !== "ja")
      && (data.flereBarnISammeSoknad.harBarnaDeltFastBosted === "ja"))

    ||  
    (_.some(data.omSamvaerForHvertAvBarnaSoknadenGjelder, (row) => { 

  return (row.erDetEndringIDetteBarnetsBosted !== "ja")
      && (row.harBarnetDeltFastBosted1 === "ja");
     }));`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show =  (data.ettBarn.blirBarnetHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja")
    ||
(_.some(data.opplysningerOmBarn, (row) => { 
return row.forsorgesBarnetAvAndreEnnForeldrene === "ja"; 
}));`,
  ],
  nav540006: [
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.harBidragsbarnetFylt18Ar === "nei")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.harBidragsbarnetFylt18Ar === "ja")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") 
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre");`,
    `show = (data.erDuIVideregaendeOpplaringFraTidspunktetDuSokerFra === "ja") ||
       (data.erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetSokerFra === "ja")
;`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.harBidragsbarnetFylt18Ar === "nei");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = data.harBidragsbarnetFylt18Ar === "ja" || data.hvemErDuSomSoker === "andre";`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.harBidragsbarnetFylt18Ar === "nei")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.sokerDuTilbakeITid === "ja")
    || (data.sokerBidragsbarnetTilbakeITid === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv"))
    && (data.hvaSokerDuOm === "endringAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaSokerBidragsbarnetOm === "endringAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaSokerBidragsbarnetOm === "endringAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && ((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
     || (data.erDetEndringISamvaeret === "ja"));`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && ((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
     || (data.erDetEndringISamvaeret === "ja"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     || (data.hvemErDuSomSoker === "andre"))
    && ((data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag")
     || (data.erDetEndringISamvaeret === "ja"));`,
    `show = (data.erDetAvtaltAtDuSkalHaSamvaerMedBidragsbarnetEtterFylte18Ar === "ja")
    || (data.harDuAvtaltAHaSamvaerMedDenSomErBidragspliktigEtterFylte18Ar === "ja")
    || (data.harBidragsbarnetAvtaltAHaSamvaerMedDenSomErBidragspliktigEtterFylte18Ar === "ja");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.harDuSamvaerIFerier=== "ja")
    || (data.harBidragsbarnetSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja");`,
    `show = (row.samvaeretErAvtaltFastsattVed === "skriftligAvtale") ||
       (row.samvaeretErAvtaltFastsattVed === "muntligAvtale");`,
    `show = (row.samvaeretErAvtaltFastsattVed === "dom") ||
       (row.samvaeretErAvtaltFastsattVed === "rettsforlik");`,
    `show = (row.gjennomforesSamvaeretSlikDetErAvtalt2 === "nei") ||
       (row.gjennomforesSamvaeretSlikDetErFastsatt2 === "nei");`,
    `show = (data.harDuSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja")
    || (data.harBidragsbarnetSamvaerIFerier === "ja");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `var hide = (data.ferieJulOgNyttar === true)
        || (data.vinterferie === true)
        || (data.paskeferie === true)
        || (data.sommerferie === true)
        || (data.hostferie === true)
        || (data.andreHoytiderEllerFerier === true)
; 
show = !hide;`,
    `show = (data.kjennerDuDetNorskeFodselsnummeretEllerDNummeretTilDenDuSokerBidragFra === "nei") ||
       (data.kjennerDuDetNorskeFodselsnummeretEllerDNummeretTilDenDuSokerBidragFra === "denJegSokerBidragFraHarIkkeNorskFodselsnummerEllerDNummer");`,
    `show = (data.kjennerDuDetNorskeFodselsnummeretEllerDNummeretTilDenDuSokerBidragFra === "nei") ||
       (data.kjennerDuDetNorskeFodselsnummeretEllerDNummeretTilDenDuSokerBidragFra === "denJegSokerBidragFraHarIkkeNorskFodselsnummerEllerDNummer") ||
       (data.borDenDuSokerBidragFraPaSinFolkeregistrerteAdresse === "nei");`,
    `show = (data.borDenDuSokerBidragFraINorge === "ja") ||
       (data.borDenDuSokerBidragFraINorge === "nei");`,
    `show = (data.borDenDuSokerBidragFraINorge === "ja") &&
       (data.vetDuAdressen1 === "ja");`,
    `show = (data.borDenDuSokerBidragFraINorge === "nei") &&
       (data.vetDuAdressen1 === "ja");`,
    `show = (data.borDenDuSokerBidragFraINorge === "nei") &&
       (data.vetDuAdressen1 === "nei");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.kjennerDuDenBidragspliktigesNorskeFodselsnummerEllerDNummer === "nei") ||
       (data.kjennerDuDenBidragspliktigesNorskeFodselsnummerEllerDNummer === "denBidragspliktigeHarIkkeNorskFodselsnummerEllerDNummer");`,
    `show = (data.kjennerDuDenBidragspliktigesNorskeFodselsnummerEllerDNummer === "nei") ||
       (data.kjennerDuDenBidragspliktigesNorskeFodselsnummerEllerDNummer === "denBidragspliktigeHarIkkeNorskFodselsnummerEllerDNummer") ||
       (data.borDenBidragspliktigePaSinFolkeregistrerteAdresse === "nei");`,
    `show = (data.borDenBidragspliktigeINorge === "ja") ||
       (data.borDenBidragspliktigeINorge === "nei");`,
    `show = (data.borDenBidragspliktigeINorge === "ja") &&
       (data.vetDuAdressen === "ja");`,
    `show = (data.borDenBidragspliktigeINorge === "nei") &&
       (data.vetDuAdressen === "ja");`,
    `show = (data.borDenBidragspliktigeINorge === "nei") &&
       (data.vetDuAdressen === "nei");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 1)
    && (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg < 100);`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 2)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 3)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 4)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 5)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaSokerBidragsbarnetOm === "endringAvBarnebidrag")
    || (data.harDuEnAvtaleOmBarnebidragSomGjelderFraEtterFylte18Ar === "ja")
    || (data.harBidragsbarnetEnAvtaleOmBarnebidragSomGjelderFraEtterFylte18Ar === "ja");`,
    `show = ((data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaSokerBidragsbarnetOm === "endringAvBarnebidrag"))
    && (data.oppgiAvtaleform === "skriftlig");`,
    `show = (((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag"))
    && (data.oppgiAvtaleform === "skriftlig"))
    || (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = (data.bidragetErFastsattVed === "privatAvtale") ||
       (data.bidragetErFastsattVed === "rettsforlik") ||
       (data.bidragetErFastsattVed === "dom");`,
    `show = (data.bidragetErFastsattVed === "privatAvtale") ||
       (data.bidragetErFastsattVed === "rettsforlik") ||
       (data.bidragetErFastsattVed === "dom");`,
    `show = ((data.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
    || (data.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "neiViGjorOppPrivatOssIMellom"))
    && (data.bidragetErFastsattVed === "privatAvtale");`,
    `show = ((data.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "jaJegOnskerAtSkatteetatenSkalKreveInnBidraget")
    || (data.onskerDuAtSkatteetatenSkalKreveInnBarnebidraget === "neiViGjorOppPrivatOssIMellom"))
    && (data.bidragetErFastsattVed === "nav");`,
    `show = ((data.onskerBidragsbarnetAtSkatteetatenSkalKreveInnBarnebidraget === "jaBidragsbarnetOnskerAtSkatteetatenSkalKreveInnBidraget")
    || (data.onskerBidragsbarnetAtSkatteetatenSkalKreveInnBarnebidraget === "neiDeGjorOppPrivatSegIMellom"))
    && (data.bidragetErFastsattVed === "privatAvtale");`,
    `show = ((data.onskerBidragsbarnetAtSkatteetatenSkalKreveInnBarnebidraget === "jaBidragsbarnetOnskerAtSkatteetatenSkalKreveInnBidraget")
    || (data.onskerBidragsbarnetAtSkatteetatenSkalKreveInnBarnebidraget === "neiDeGjorOppPrivatSegIMellom"))
    && (data.bidragetErFastsattVed === "nav");`,
    `show = (data.harDuFattBarnebidragetIHenholdTilAvtalen === "jegHarFattNoe")
    || (data.harDuFattBarnebidragetIHenholdTilFastsettelsen === "jegHarFattNoe")
    || (data.harBidragsbarnetFattBarnebidragetIHenholdTilAvtalen === "harFattNoe")
    || (data.harBidragsbarnetFattBarnebidragetIHenholdTilFastsettelsen === "harFattNoe");`,
    `show = ((data.sokerDuOmAtSkatteetatenKreverInnBarnebidragetFraDeg === "jaJegOnskerAtSkatteetatenSkalKreveInnBidragetFraMeg")
    || (data.sokerDuOmAtSkatteetatenKreverInnBarnebidragetFraDeg === "neiViGjorOppPrivatOssIMellom"))
    && (data.bidragetErFastsattVed === "privatAvtale");`,
    `show = ((data.sokerDuOmAtSkatteetatenKreverInnBarnebidragetFraDeg === "jaJegOnskerAtSkatteetatenSkalKreveInnBidragetFraMeg")
    || (data.sokerDuOmAtSkatteetatenKreverInnBarnebidragetFraDeg === "neiViGjorOppPrivatOssIMellom"))
    && (data.bidragetErFastsattVed === "nav");`,
    `show = (data.harDuBetaltBidragetIHenholdTilAvtalen === "harBetaltNoe")
    || (data.harDuBetaltBidragetIHenholdTilFastsettelsen === "harBetaltNoe");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar") ||
       (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIJobbenDin === "ja");`,
    `show = (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIJobbenTilBidragsbarnet === "ja");`,
    `show = (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIJobbenDinBidragspliktig === "ja");`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
     || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv"))
    && (data.hvaSokerDuOm === "endringAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaSokerBidragsbarnetOm === "endringAvBarnebidrag");`,
    `show = (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIInntektenDin === "ja");`,
    `show = (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIBidragsbarnetsInntekt === "ja");`,
    `show = (data.harDuSkattepliktigInntektINorge === "neiJegHarIkkeSkattepliktigInntekt")
    && (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge")
    || (data.harBidragsbarnetSkattepliktigInntektINorge === "neiMenBidragsbarnetHarInntektUtenforNorge");`,
    `show = (data.harDuSkattepliktigInntektINorge === "ja")
    || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge")
    || (data.harBidragsbarnetSkattepliktigInntektINorge === "neiMenBidragsbarnetHarInntektUtenforNorge")
    || (data.harBidragsbarnetSkattepliktigInntektINorge === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.harAnnenInntekt.harDuSkattepliktigInntektSomSelvstendigNaeringsdrivendeEllerFrilanser === "ja")
    || (data.harAnnenInntekt.harBidragsbarnetSkattepliktigInntektSomSelvstendigNaeringsdrivendeEllerFrilanser === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && ((data.harDuSkattepliktigInntektINorge === "ja")
     || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && ((data.harBidragsbarnetSkattepliktigInntektINorge === "ja")
     || (data.harBidragsbarnetSkattepliktigInntektINorge === "neiMenBidragsbarnetHarInntektUtenforNorge"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     && (data.harBidragsbarnetFylt18Ar === "ja"))
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.hvaSokerBidragsbarnetOm === "fastsettelseAvBarnebidrag"))
    && (data.oppgiAvtaleform === "skriftlig"))
    || (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = (data.erDuIVideregaendeOpplaringFraTidspunktetDuSokerFra === "ja") ||
       (data.erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetSokerFra === "ja")
   || (data.borDuSammenMedEgneBarnSomGarPaVideregaendeSkole === "ja");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
  ],
  nav540009: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke");`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr") ||
(data.borMotpartenEtAnnetStedEnnDenAdressenVedkommendeErRegistrertMedIFolkeregisteret === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") ||
(data.borMotpartenINorge === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "nei");`,
    `show = (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.bidragetErFastsattVed === "privatAvtale") ||
       (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show = (row.bidragetErFastsattVed === "privatAvtale") ||
       (row.bidragetErFastsattVed === "rettsforlik") ||
       (row.bidragetErFastsattVed === "dom");`,
    `show=
(row.bidragetErFastsattVed === "nav") ||
(row.bidragetErFastsattVed === "rettsforlik") ||
(row.bidragetErFastsattVed === "dom");`,
    `show = (row.harDuTidligereMottattBidragForDetteBarnet === "jegHarFattNoe")
    || (row.harDuTidligereMottattBidragForDetteBarnetIHenholdTilFastsettelsen === "jegHarFattNoe");`,
    `show = 
_.some(data.opplysningerOmBarn, (rad) => {
  return rad.harBarnetDeltFastBosted === "ja";
});`,
    `show = (data.kommerDuTilASendeInnEnPrivatAvtaleEllerEnSoknadOmAtNavSkalFastsetteBidraget === "jaJegVilSendeEnKopiAvPrivatAvtale")
||
(_.some(data.navaerendeAvtalerOmBarnebidragForBarnDuSokerForskuddFor, (row) => {  

  return (row.oppgiAvtaleform === "skriftlig"); 
}));`,
    `show = _.some(data.navaerendeAvtalerOmBarnebidragForBarnDuSokerForskuddFor, (row) => {  

  return (row.bidragetErFastsattVed === "rettsforlik"); 
});`,
    `show = _.some(data.navaerendeAvtalerOmBarnebidragForBarnDuSokerForskuddFor, (row) => {  

  return (row.bidragetErFastsattVed === "dom"); 
});`,
  ],
  nav540010: [
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.harBidragsbarnetFylt18Ar === "nei")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.harBidragsbarnetFylt18Ar === "ja")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre") ||
        (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar");`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre") ||
        (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar"))
    && ((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag"));`,
    `show = (data.sokerDuTilbakeITid === "ja")
    || (data.sokerBidragsbarnetTilbakeITid === "ja");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.sokerTilbakeITid.harDenDuSokerBidragFraForsorgetDegNoeOkonomiskIPeriodenDuSokerTilbakeITid === "ja")
    || (data.sokerTilbakeITid.harDenBidragspliktigeForsorgetBidragsbarnetNoeOkonomiskIPeriodenDetErSoktTilbakeITid === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") 
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre");`,
    `show = (data.erDuIVideregaendeOpplaeringFraTidspunktetDetErSoktFra === "ja") ||
       (data.erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetErSoktFra === "ja")
;`,
    `show = (data.erDuIVideregaendeOpplaeringFraTidspunktetDetErSoktFra === "ja")
    && (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
    && (data.erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetErSoktFra === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.harBidragsbarnetFylt18Ar === "nei");`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
    && (data.blirDuHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja");`,
    `show = ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
     && (data.blirDuHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja"))
    || ((data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
     && ((data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerDeg === "nei")
      || (data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerDeg === "vetIkke")));`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = data.harBidragsbarnetFylt18Ar === "ja" || data.hvemErDuSomSoker === "andre";`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.harBidragsbarnetFylt18Ar === "nei")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
    && (data.blirBidragsbarnetHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja");`,
    `show = ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
     && (data.blirBidragsbarnetHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja"))
    || ((data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
     && ((data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerBidragsbarnet === "nei")
      || (data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerBidragsbarnet === "vetIkke")));`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
     || (data.erDetEndringISamvaeret === "ja"));`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && ((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
     || (data.erDetEndringISamvaeret === "ja"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     || (data.hvemErDuSomSoker === "andre"))
    && ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
     || (data.erDetEndringISamvaeret === "ja"));`,
    `show = (data.harDuOgDenBidragspliktigeAvtaltAHaSamvaerEtterAtDuHarFylt18Ar === "ja")
    || (data.harDuOgBidragsbarnetAvtaltAHaSamvaerEtterFylte18Ar === "ja")
    || (data.harBidragsbarnetOgDenBidragspliktigeAvtaltAHaSamvaerEtterFylte18Ar === "ja");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.harDuSamvaerIFerier=== "ja")
    || (data.harBidragsbarnetSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja");`,
    `show = (row.samvaeretErAvtaltFastsattVed === "skriftligAvtale") ||
       (row.samvaeretErAvtaltFastsattVed === "muntligAvtale");`,
    `show = (row.samvaeretErAvtaltFastsattVed === "dom") ||
       (row.samvaeretErAvtaltFastsattVed === "rettsforlik");`,
    `show = (row.gjennomforesSamvaeretSlikDetErAvtalt2 === "nei") ||
       (row.gjennomforesSamvaeretSlikDetErFastsatt2 === "nei");`,
    `show = (data.harDuSamvaerIFerier === "ja")
    || (data.harDuSamvaerMedBarnetIFerier === "ja")
    || (data.harBidragsbarnetSamvaerIFerier === "ja");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `var hide = (data.ferieJulOgNyttar === true)
        || (data.vinterferie === true)
        || (data.paskeferie === true)
        || (data.sommerferie === true)
        || (data.hostferie === true)
        || (data.andreHoytiderEllerFerier === true)
; 
show = !hide;`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 1)
    && (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg < 100);`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 2)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 3)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 4)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 5)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = ((data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
     || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv"))
    && ((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
     || (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
    || (data.harDuEnAvtaleOmBarnebidragSomGjelderFraEtterFylte18Ar === "ja")
    || (data.harBidragsbarnetEnAvtaleOmBarnebidragSomGjelderFraEtterFylte18Ar === "ja");`,
    `show = (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = (data.bidragetErFastsattVed === "privatAvtale") ||
       (data.bidragetErFastsattVed === "rettsforlik") ||
       (data.bidragetErFastsattVed === "dom");`,
    `show = (data.bidragetErFastsattVed === "privatAvtale") ||
       (data.bidragetErFastsattVed === "rettsforlik") ||
       (data.bidragetErFastsattVed === "dom");`,
    `show = (data.oppgiAvtaleform === "skriftlig")
    || (data.bidragetErFastsattVed === "nav");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && ((row.oppgiAvtaleform === "muntlig") 
    || ((row.oppgiAvtaleform === "skriftlig")
    &&  (row.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.bidragetErFastsattVed === "nav")
    && (data.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && ((row.oppgiAvtaleform === "muntlig") 
    || ((row.oppgiAvtaleform === "skriftlig")
    &&  (row.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show = (data.bidragetErFastsattVed === "nav")
       &&
       ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
      && (data.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = (data.harDuFattBarnebidragetIHenholdTilAvtalen === "jegHarFattNoe")
    || (data.harDuFattBarnebidragetIHenholdTilFastsettelsen === "jegHarFattNoe")
    || (data.harBidragsbarnetFattBarnebidragetIHenholdTilAvtalen === "harFattNoe")
    || (data.harBidragsbarnetFattBarnebidragetIHenholdTilFastsettelsen === "harFattNoe");`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && ((row.oppgiAvtaleform === "muntlig") 
    || ((row.oppgiAvtaleform === "skriftlig")
    &&  (row.kreverSkatteetatenInnBarnebidraget === "nei")));`,
    `show = (data.bidragetErFastsattVed === "nav")
       &&
       (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
         && (data.kreverSkatteetatenInnBarnebidraget === "nei");`,
    `show = (data.harDuBetaltBidragetIHenholdTilAvtalen === "harBetaltNoe")
    || (data.harDuBetaltBidragetIHenholdTilFastsettelsen === "harBetaltNoe");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar") ||
       (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet") ||
       (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIJobbenDin === "ja"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIJobbenTilBidragsbarnet === "ja"));`,
    `show = (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
    || (data.erDetEndringIJobbenDinBidragspliktig === "ja");`,
    `show = (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv")
    && (data.hvaSokerDuOm === "fastsettelseAvBarnebidrag");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv"))
    && ((data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = ((data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv"))
    && ((data.hvaSokerDuOm === "endringAvBarnebidrag")
    || (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && (data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag");`,
    `show = (((data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
      || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv"))
     && ((data.hvaSokerDuOm === "fastsettelseAvBarnebidrag")
      || (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")))
     || (data.erDetEndringIInntektenDin === "ja");`,
    `show = (((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
      || (data.hvemErDuSomSoker === "andre"))
      && (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag"))
      || (data.erDetEndringIBidragsbarnetsInntekt === "ja");`,
    `show = (data.harDuSkattepliktigInntektINorge === "neiJegHarIkkeSkattepliktigInntekt")
    && (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge")
    || (data.harBidragsbarnetSkattepliktigInntektINorge === "neiMenBidragsbarnetHarInntektUtenforNorge");`,
    `show = (data.harDuSkattepliktigInntektINorge === "ja")
    || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge")
    || (data.harBidragsbarnetSkattepliktigInntektINorge === "neiMenBidragsbarnetHarInntektUtenforNorge")
    || (data.harBidragsbarnetSkattepliktigInntektINorge === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    || (data.hvemErDuSomSoker === "enBidragspliktigForelderPaVegneAvSegSelv");`,
    `show = (data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.harAnnenInntekt.harDuSkattepliktigInntektSomSelvstendigNaeringsdrivendeEllerFrilanser === "ja")
    || (data.harAnnenInntekt.harBidragsbarnetSkattepliktigInntektSomSelvstendigNaeringsdrivendeEllerFrilanser === "ja");`,
    `show = (data.hvemErDuSomSoker === "bidragsbarnetEtterFylte18Ar")
    && ((data.harDuSkattepliktigInntektINorge === "ja")
     || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
    || (data.hvemErDuSomSoker === "andre"))
    && ((data.harBidragsbarnetSkattepliktigInntektINorge === "ja")
     || (data.harBidragsbarnetSkattepliktigInntektINorge === "neiMenBidragsbarnetHarInntektUtenforNorge"));`,
    `show = ((data.hvemErDuSomSoker === "enForelderAvBidragsbarnet")
     && (data.harBidragsbarnetFylt18Ar === "ja"))
    || (data.hvemErDuSomSoker === "andre");`,
    `show = (data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
    && ((data.erDuIVideregaendeOpplaeringFraTidspunktetDetErSoktFra === "ja")
     || (data.erBidragsbarnetIVideregaendeOpplaeringFraTidspunktetDetErSoktFra === "ja"))
     || (data.borDuSammenMedEgneBarnSomGarPaVideregaendeSkole === "ja");`,
    `show = (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "nei")
    || (data.erDenPrivateAvtalenSendtInnTidligereIDenneSaken === "vetIkke");`,
    `show = ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
     && (data.blirDuHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja"))
    || ((data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
     && ((data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerDeg === "nei")
      || (data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerDeg === "vetIkke")));`,
    `show = ((data.hvaHarDenBidragspliktigeSoktOm === "fastsettelseAvBarnebidrag")
     && (data.blirBidragsbarnetHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon === "ja"))
    || ((data.hvaHarDenBidragspliktigeSoktOm === "endringAvBarnebidrag")
     && ((data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerBidragsbarnet === "nei")
      || (data.harNavFattBekreftetIDenneSakenAtBarnevernetEllerEnInstitusjonForsorgerBidragsbarnet === "vetIkke")));`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
  ],
  nav540011: [
    `show =
(data.harDuNorskFodselsnummerEllerDNummer === "nei") ||
(data.borDuEtAnnetStedEnnDenAdressenDuErRegistrertMedIFolkeregisteret === "ja");`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr");`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr");`,
    `show=
(data.borMotpartenINorge === "ja") ||
(data.borMotpartenINorge === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "nei");`,
    `show=
(row.erSamvaeretMedDenBidragspliktigeUtelukkendePaDagtid !== "");`,
    `show=
row.borBarnetSammenMedDeg === "nei";`,
    `show=
_.some(data.opplysningerOmBarn, (rad) => {return rad.harDuDokumentasjonPaDenneAvtalen === "ja";});`,
    `show=
_.some(data.opplysningerOmBarn, (rad) => {return rad.harDuDokumentasjonPaDenneDommen === "ja";});`,
    `show = _.some(data.opplysningerOmBarn, (rad) => {
  return rad.avtaltDeltBosted.harDuDokumentasjonPaDenneAvtalen === "ja";
});`,
    `show=
_.some(data.andreBarnSomDuForsorger, (rad) => {return rad.bidragPerManed.harDuDokumentasjonPaBetaltBidragForDetteBarnet === "ja";});`,
  ],
  nav540013: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei"
|| row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke"
;`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke");`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr") ||
(data.borMotpartenEtAnnetStedEnnDenAdressenVedkommendeErRegistrertMedIFolkeregisteret === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") ||
(data.borMotpartenINorge === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "nei");`,
    `show = (data.harDuSkattepliktigInntektINorge === "ja")
    || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge");`,
    `show = _.some(data.detDuSokerOmForHvertAvBarna, (row)=> {

return row.hvaSokerDuSaerbidragForTilDetteBarnet.konfirmasjon === true;
});`,
    `show = _.some(data.detDuSokerOmForHvertAvBarna, (row)=> {

return row.hvaSokerDuSaerbidragForTilDetteBarnet.briller === true;
});`,
    `show = _.some(data.detDuSokerOmForHvertAvBarna, (row)=> {

return row.hvaSokerDuSaerbidragForTilDetteBarnet.linser === true;
});`,
    `show = _.some(data.detDuSokerOmForHvertAvBarna, (row)=> {

return row.hvaSokerDuSaerbidragForTilDetteBarnet.tannregulering === true;
});`,
    `show = _.some(data.detDuSokerOmForHvertAvBarna, (row)=> {

return row.hvaSokerDuSaerbidragForTilDetteBarnet.annet === true;
});`,
    `show = (_.some(data.opplysningerOmBarn, (row) => { 
return row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "nei"
||  (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken === "vetIkke");
}))
;`,
  ],
  nav540014: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorgeX === "nei" || (row.adresse.borDuINorgeX === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnet === "nei"
|| row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnet === "vetIkke"
;`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 1)
    && (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg < 100);`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 2)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 3)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 4)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 5)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg === 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg > 6)
    && (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (row.harDuBetaltSaerbidragetTilKonfirmasjonen === "jaISinHelhet")
    || (row.harDuBetaltSaerbidragetTilKonfirmasjonen === "jegHarBetaltNoe");`,
    `show = (row.harDuBetaltSaerbidragetTilBrilleneEtterAvtalen === "jaISinHelhet")
    || (row.harDuBetaltSaerbidragetTilBrilleneEtterAvtalen === "jegHarBetaltNoe");`,
    `show = (row.harDuBetaltSaerbidragetTilLinseneEtterAvtalen === "jaISinHelhet")
    || (row.harDuBetaltSaerbidragetTilLinseneEtterAvtalen === "jegHarBetaltNoe");`,
    `show = (row.harDuBetaltSaerbidragetTilTannreguleringenEtterAvtalen === "jaISinHelhet")
    || (row.harDuBetaltSaerbidragetTilTannreguleringenEtterAvtalen === "jegHarBetaltNoe");`,
    `show = row.harDuOgDenAndrePartenAvtaltADelePaUtgifteneTilAnnet === "ja"
;`,
    `show = row.harDuOgDenAndrePartenAvtaltADelePaUtgifteneTilAnnet === "ja"
;`,
    `show = (row.harDuBetaltSaerbidragetTilAnnetEtterAvtalen === "jaISinHelhet")
    || (row.harDuBetaltSaerbidragetTilAnnetEtterAvtalen === "jegHarBetaltNoe");`,
    `show = row.harDuBetaltSaerbidragetTilKonfirmasjonen === "jegHarBetaltNoe"
|| row.harDuBetaltSaerbidragetTilBrilleneEtterAvtalen === "jegHarBetaltNoe"
|| row.harDuBetaltSaerbidragetTilLinseneEtterAvtalen === "jegHarBetaltNoe"
|| row.harDuBetaltSaerbidragetTilTannreguleringenEtterAvtalen === "jegHarBetaltNoe"
|| row.harDuBetaltSaerbidragetTilAnnetEtterAvtalen === "jegHarBetaltNoe"
;`,
    `show = (data.harDuSkattepliktigInntektINorge === "ja")
    || (data.harDuSkattepliktigInntektINorge === "neiMenJegHarInntektUtenforNorge");`,
    `show = (data.harDetteBarnetAvtaleOmDeltFastBosted === "ja")
    || (data.harNoenAvDisseBarnaAvtaleOmDeltFastBosted === "ja");`,
    `show = (_.some(data.omSaerbidraget, (row) => { 
return  (row.harDuBetaltSaerbidragetTilKonfirmasjonen === "jaISinHelhet")
    ||  (row.harDuBetaltSaerbidragetTilKonfirmasjonen === "jegHarBetaltNoe");
}))
;`,
    `show = (_.some(data.omSaerbidraget, (row) => { 
return  (row.harDuBetaltSaerbidragetTilBrilleneEtterAvtalen === "jaISinHelhet")
    ||  (row.harDuBetaltSaerbidragetTilBrilleneEtterAvtalen === "jegHarBetaltNoe");
}))
;`,
    `show = (_.some(data.omSaerbidraget, (row) => { 
return (row.harDuBetaltSaerbidragetTilLinseneEtterAvtalen === "jaISinHelhet")
||  (row.harDuBetaltSaerbidragetTilLinseneEtterAvtalen === "jegHarBetaltNoe");
}))
;`,
    `show = (_.some(data.omSaerbidraget, (row) => { 
return row.harDuOgDenAndrePartenAvtaltADelePaUtgifteneTilTannregulering === "ja"

&&  (row.harDuBetaltSaerbidragetTilTannregulering === "jaISinHelhet")
||  (row.harDuBetaltSaerbidragetTilTannregulering === "jegHarBetaltNoe")
}))
;`,
    `show = (_.some(data.omSaerbidraget, (row) => { 
return row.harDuOgDenAndrePartenAvtaltADelePaUtgifteneTilAnnet === "ja"

&&  (row.harDuBetaltSaerbidragetTilAnnet === "jaISinHelhet")
||  (row.harDuBetaltSaerbidragetTilAnnet === "jegHarBetaltNoe")
}))
;`,
    `show = _.some(data.omBidragsbarnet, (row) => { 

return (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnet === "nei")
    || (row.harNavMottattAvtalenOmDeltFastBostedForDetteBarnet === "vetIkke"); 

});`,
  ],
  nav550060: [
    `show=
((data.erDetteEnNyAvtale === "ja") && (data.oppgjorsform === "navInnkreving")) ||
((data.erDetteEnNyAvtale === "nei") && (data.dagensOppgjorsform === "navInnkreving1") && (data.oppgjorsform === "privat")) ||
((data.erDetteEnNyAvtale === "nei") && (data.dagensOppgjorsform === "privat1") && (data.oppgjorsform === "navInnkreving"));`,
  ],
  nav550063: [
    `show=
((data.erDetteEnNyAvtale === "ja") && (data.oppgjorsform === "navInnkreving")) ||
((data.erDetteEnNyAvtale === "nei") && (data.dagensOppgjorsform === "navInnkreving1") && (data.oppgjorsform === "privat")) ||
((data.erDetteEnNyAvtale === "nei") && (data.dagensOppgjorsform === "privat1") && (data.oppgjorsform === "navInnkreving"));`,
  ],
  nav550071: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav554401: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr");`,
    `show=
(data.harMotpartenNorskFodselsnummerEllerDNummer === "nei") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "vetIkke") ||
(data.harMotpartenNorskFodselsnummerEllerDNummer === "jaMenJegVetIkkeHvaDetEr");`,
    `show=
(data.borMotpartenINorge === "ja") ||
(data.borMotpartenINorge === "nei");`,
    `show=
(data.borMotpartenINorge === "ja") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "ja");`,
    `show=
(data.borMotpartenINorge === "nei") &&
(data.vetDuAdressen === "nei");`,
    `show = _.some(data.opplysningerOmBarn, (row) => { 

return row.hvaGjelderSoknadenForDetteBarnet === "stadfestelseAvAvtaleOmDelingAvBarnsReisekostnaderVedSamvaerBeggeForeldreneMaVaereEnigeOmAtNavSkalStadfesteEnAlleredeInngattAvtale"; 

});`,
  ],
  nav570008: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.avvikerKapitalinntektenVesentligFraForrigeArsLigning === "ja")
    || (data.avvikerNaeringsinntektenVesentligFraForrigeArsInntekt === "ja");`,
  ],
  nav620016: [
    `show = (data.hvaErDinSivilstatus === "giftPartner");`,
    `show = (data.hvaErDinSivilstatus === "ugift")
    || (data.hvaErDinSivilstatus === "separert")
    || (data.hvaErDinSivilstatus === "skilt")
    || (data.hvaErDinSivilstatus === "enkeEnkemann");`,
    `show = (data.erDuSamboer === "ja") || 
       (data.hvaErDinSivilstatus === "giftPartner");`,
  ],
  nav620301: [
    `show = (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "jegSkalOppgiInntektSomErOpptjentForForsteUttakAvAfp")
    || (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "beggeDeler")
;`,
    `show = (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "jegSkalOppgiInntektSomErOpptjentEtterOpphorAvAfp")
    || (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "beggeDeler")
;`,
    `show = (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "jegSkalOppgiInntektSomErOpptjentForForsteUttakAvAfp")
    || (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "beggeDeler")
;`,
    `show = (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "jegSkalOppgiInntektSomErOpptjentEtterOpphorAvAfp")
    || (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "beggeDeler")
;`,
    `show = (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "jegSkalOppgiInntektSomErOpptjentEtterOpphorAvAfp")
    || (data.skalDuGiOpplysningerOmInntektSomErOpptjentForForsteUttakAvAfp === "beggeDeler")
;`,
    `show = (data.lonnsslippFraManedenForForsteUttakAvAfp === "ettersender")
    || (data.dokumentasjonPaEtterbetalingAvLonnSomErOpptjentFor === "ettersender")
    || (data.dokumentasjonPaBonusHonorarEllerRoyalty === "ettersender")
    || (data.kopiAvDokumentasjonPaEierinntektAksjeselskap === "ettersender")
    || (data.kopiAvDokumentasjonPaAnnenInntekt === "ettersender")
    || (data.lonnsslippFraManedenEtterOpphorAvAfp === "ettersender")
    || (data.dokumentasjonPaAndreInntekterSomIkkeVisesPaLonnsslippen === "ettersender")
    || (data.bekreftelseFraArbeidsgiverOmAtDuHarHattEkstraordinaertKoronarelatertArbeid === "ettersender")
    || (data.annenDokumentasjon === "ettersender")
;`,
  ],
  nav640100: [
    `show=
(data.hvilkenFunksjonRepresentererDu !== "jegErSoker");`,
    `show=
(data.hvilkenFunksjonRepresentererDu !== "jegErSoker");`,
    `show=
(data.hvilkenFunksjonRepresentererDu !== "jegErSoker");`,
    `show=
(data.hvilkenFunksjonRepresentererDu === "jegErSoker") || (data.harSokerNorskFodselsnummerEllerDNummer === "ja");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show=
(data.eierSokerEgenBolig === "nei") || 
((data.eierSokerEgenBolig === "ja") && (data.borSokerIBoligen === "nei"));`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show=
(data.eierEktefelleSamboerEgenBolig === "nei") || 
((data.eierEktefelleSamboerEgenBolig === "ja") && (data.borEktefelleSamboerIBoligen === "nei"));`,
    `show=
(data.harEktefelleSamboerMerEnn1000KronerIKontanter === "ja");`,
    `show=
(row.harEktefelleInntekterAvKapitalEllerAnnenFormue === "ja");`,
    `show=
(data.harEktefelleSamboerAndreYtelserFraNav === "ja");`,
    `show=
(row.mottarEktefellSamboerTrygdeytelserOgEllerPensjonIUtlandet === "ja");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.hvilkenFunksjonRepresentererDu === "vergeForSoker");`,
    `show =
(data.eierSokerEgenBolig === "ja") ||
(data.harSokerEnDepositumkonto === "ja") ||
(data.eierSokerAndreEiendommerINorgeEllerUtlandet === "ja") ||
(data.eierSokerBilCampingvognEllerAndreKjoretoy === "ja") ||
(data.harSokerPengerPaKonto === "ja") ||
(data.harSokerAksjerAksjefondEllerVerdipapirer === "ja");`,
    `show =
(data.eierEktefelleSamboerEgenBolig === "ja") ||
(data.harEktefelleSamboerDepositumskonto === "ja") ||
(data.eierEktefelleSamboerAndreEiendommerINorgeEllerUtlandet === "ja") ||
(data.eierEktefelleSamboerBilCampingvognEllerAndreKjoretoy === "ja") ||
(data.harEktefelleSamboerPengerPaKonto === "ja") ||
(data.harEktefelleSamboerAksjerAksjefondOgEllerVerdipapir === "ja");`,
  ],
  nav642100: [
    `show=
(data.hvemErTilstedeUnderUtfyllingAvSoknaden === "sokersFullmektige") ||
(data.hvemErDu === "vergeForSoker");`,
    `show=
(data.opplysningerOmRepresentantForSoker.fullmektigHarIkkeNorskFodselsnummerDNummer === false) ||
(data.opplysningerOmRepresentantForSoker.vergeHarIkkeNorskFodselsnummerDNummer === false);`,
    `show=
(data.opplysningerOmRepresentantForSoker.fullmektigHarIkkeNorskFodselsnummerDNummer === true) ||
(data.opplysningerOmRepresentantForSoker.vergeHarIkkeNorskFodselsnummerDNummer === true);`,
    `show=
(data.opplysningerOmRepresentantForSoker.borFullmektigINorge === "ja") ||
(data.opplysningerOmRepresentantForSoker.borVergeINorge === "ja");`,
    `show=
(data.opplysningerOmRepresentantForSoker.borFullmektigINorge === "nei") ||
(data.opplysningerOmRepresentantForSoker.borVergeINorge === "nei");`,
    `show=
(data.hvemErDu !== "jegErSoker");`,
    `show=
(data.hvemErDu !== "jegErSoker");`,
    `show=
(data.hvemErDu !== "jegErSoker");`,
    `show=
(data.hvemErDu === "jegErSoker") || (data.harSokerNorskFodselsnummerEllerDNummer === "ja");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer === "ja") &&
(data.borSokerFastINorge === "ja");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer === "ja") &&
(data.borSokerFastINorge === "ja");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show = (data.harSokerOppholdstillatelseINorge === "ja") || 
(data.harSokerOppholdstillatelseINorge === "nei")
;`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show=
(data.eierSokerEgenBolig === "nei") || 
((data.eierSokerEgenBolig === "ja") && (data.borSokerIBoligen === "nei"));`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show=
(data.eierEktefelleSamboerEgenBolig === "nei") || 
((data.eierEktefelleSamboerEgenBolig === "ja") && (data.borEktefelleSamboerIBoligen === "nei"));`,
    `show =
(data.harEktefelleSamboerRegistrertPartnerMerEnn1000KronerIKontanter === "ja");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show =
(data.harSokerNorskFodselsnummerEllerDNummer !== "nei") &&
(data.borSokerFastINorge !== "nei") &&
(data.hvemErDu === "vergeForSoker");`,
    `show =
(data.eierSokerEgenBolig === "ja") ||
(data.harSokerEnDepositumkonto === "ja") ||
(data.eierSokerAndreEiendommerINorgeEllerUtlandet === "ja") ||
(data.eierSokerBilCampingvognEllerAndreKjoretoy === "ja") ||
(data.harSokerPengerPaKonto === "ja") ||
(data.harSokerAksjerAksjefondEllerVerdipapirer === "ja");`,
    `show =
(data.eierEktefelleSamboerEgenBolig === "ja") ||
(data.harEktefelleSamboerDepositumskonto === "ja") ||
(data.eierEktefelleSamboerAndreEiendommerINorgeEllerUtlandet === "ja") ||
(data.eierEktefelleSamboerBilCampingvognEllerAndreKjoretoy === "ja") ||
(data.harEktefelleSamboerPengerPaKonto === "ja") ||
(data.harEktefelleSamboerAksjerAksjefondOgEllerVerdipapir === "ja");`,
  ],
  nav670101: [
    `show = (data.avtaltLonnPer === "akkordlonn") ||
       (data.avtaltLonnPer === "provisjonEllerBonus")
;`,
  ],
  nav760501: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = data.velgLand1.value === "NO";`,
    `show= data.velgLand1.value !== "NO";`,
    `show = row.bompenger > 0 || row.piggdekkavgift > 0 || row.ferje > 0 || row.annet > 0 || row.parkering > 0;`,
    `show = data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.bompenger > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.parkering > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.piggdekkavgift > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.ferje > 0 || data.kanIkkeReiseKollektivtDagligReise.kanBenytteEgenBil.annet > 0;`,
  ],
  nav760502: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show= data.velgLandReiseTilSamling.value === "NO";`,
    `show= data.velgLandReiseTilSamling.value !== "NO";`,
    `show = row.bompenger > 0 || row.piggdekkavgift > 0 || row.ferje > 0 || row.annet > 0 || row.parkering > 0;`,
    `show = data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.bompenger > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.parkering > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.piggdekkavgift > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.ferje > 0 || data.kanIkkeReiseKollektivtReiseTilSamling.kanBenytteEgenBil.annet > 0;`,
  ],
  nav760503: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show= data.velgLand3.value === "NO";`,
    `show= data.velgLand3.value !== "NO";`,
    `show = row.bompenger > 0 || row.piggdekkavgift > 0 || row.ferje > 0 || row.annet > 0 || row.parkering > 0;`,
    `show = data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.bompenger > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.parkering > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.piggdekkavgift > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.ferje > 0 || data.kanIkkeReiseKollektivtOppstartAvslutningHjemreise.kanBenytteEgenBil.annet > 0;`,
  ],
  nav760710: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav761300: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav761303: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav761318: [
    `show = (data.kreverDuRefusjonForHeleTilsagnsbelopetNa === "nei")
    && (data.harDelerAvTilsagnsbelopetBlittRefundertTidligere === "nei");`,
  ],
  nav761345: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav761380: [
    `show = (data.hvaSokerDereOm.funksjonsassistanse === true)
    || (data.hvaSokerDereOm.funksjonsassistansePaArbeidsreise === true)
;`,
  ],
  nav761381: [
    `show = (data.erRefusjonsmottakerDenSammeBedriftenSomErOppgittSomSoker === "ja")
    || (data.erRefusjonsmottakerDenSammeBedriftenSomErOppgittSomSoker === "nei")
    ;`,
    `show = (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistent === true )
    || (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistentVedArbeidsreiser === true)
    || (data.hvaKreverDereRefusjonFor.reiseutgifter === true)
;`,
    `show = (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistent === true ) || (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistentVedArbeidsreiser === true );`,
    `show = (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistent === true )
    || (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistentVedArbeidsreiser === true)
    || (data.hvaKreverDereRefusjonFor.reiseutgifter === true)
;`,
    `show = (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistent === true )
    || (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistentVedArbeidsreiser === true)
    || (data.hvaKreverDereRefusjonFor.reiseutgifter === true)
;`,
    `show = (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistent === true )
    || (data.hvaKreverDereRefusjonFor.lonnTilFunksjonsassistentVedArbeidsreiser === true)
    ;`,
  ],
  nav951536: [
    `show = (data.jegBekrefterAtJegSomFullmaktsgiverErOver18Ar === true)
    && (data.jegBekrefterAtPersonenJegSkalGiFullmaktTilEr18ArEllerEldre === true)
    && (data.jegBekrefterAtPersonenJegSkalGiFullmaktTilIkkeErAnsattINAV === true)
    ;`,
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
  nav952000: [
    `show = !["NO"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = (data.utenlandskKontonummer.bankensLand.value !== undefined) && (!["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value));`,
    `show = ["AL", "AD", "AT", "AZ", "BH", "BY", "BE", "BA", "BR", "BG", "CR", "HR", "CY",
 "CZ", "DK", "DO", "EG", "SV", "EE", "FO", "FI", "FR", "GE", "DE", "GI", "GR", "GL",
"GT", "VA", "HU", "IS", "IQ", "IE", "IL", "IT", "JO", "KZ", "XK", "KW", "LV", "LB",
"LY", "LI", "LT", "LU", "MT", "MR", "MU", "MD", "MC", "ME", "NL", "MK", "PK", "PS", "PL",
"PT", "QA", "RO", "LC", "ST", "ST", "SA", "RS", "SC", "SK", "SI", "ES", "SD", "SE", "CH",
"TL", "TN", "TR", "UA", "AE", "GB", "VG"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["AU"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["CA"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `var hide = ["US", "AS", "VI", "UM"].includes(data.utenlandskKontonummer.bankensLand.value); 
show = !hide;`,
    `show = ["AU"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["CA"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["US"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["IN"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = !["BE", "BG", "DK", "EE", "FI", "FR", "GR", "IE", "IS", "IT", "HR", "CY", "LV", "LI", "LT", "LU", "MT",
 "NL", "NO", "PL", "PT", "RO", "CH", "SE", "SK", "SI", "ES", "CZ", "DE", "HU", "AT"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = ["NO"].includes(data.utenlandskKontonummer.bankensLand.value);`,
    `show = (data.erDuUnder18Ar === "nei")
    || (data.skalDuMeldeBankkontonummerForEnYtelseDuSelvHarOpptjent === "ja");`,
    `show = (data.hvorforMelderDuOmNyttBankkontonummerPaaVegneAvEnAnnenPerson === "jegHarFullmakt")
    || (data.hvorforMelderDuOmNyttBankkontonummerPaaVegneAvEnAnnenPerson === "jegErVergeEllerHjelpeverge")
    || (data.hvorforMelderDuOmNyttBankkontonummerPaaVegneAvEnAnnenPerson === "jegErForesattTilBarnUnder18Ar")
    || (data.hvorforMelderDuOmNyttBankkontonummerPaaVegneAvEnAnnenPerson === "personenErDod");`,
  ],
  nav952002: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
    `show = (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "arbeidsavklaringspenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "dagpenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "foreldrepenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "omstillingsstonadEllerGjenlevendepensjon")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "overgangsstonad")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "pensjon")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "svangerskapspenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "sykepenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "uforetrygd")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "barnepensjonOver18Ar")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "barnepensjonUnder18Ar");`,
    `show = (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "pensjon") || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "uforetrygd");`,
    `show = (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "arbeidsavklaringspenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "barnepensjonOver18Ar")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "dagpenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "foreldrepenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "omstillingsstonadEllerGjenlevendepensjon")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "overgangsstonad")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "pensjon")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "svangerskapspenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "sykepenger")
    || (data.kryssAvForDenPengestottenDuOnskerEkstraSkattetrekkPa === "uforetrygd");`,
    `show = (data.kryssAvForDenPengestottenDuOnskerAaStoppeSkattetrekkPa === "pensjon") || (data.kryssAvForDenPengestottenDuOnskerAaStoppeSkattetrekkPa === "uforetrygd");`,
  ],
  nav952003: [
    `show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)`,
    `show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)`,
    `show = row.identitet.harDuFodselsnummer === "ja"`,
    `show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer`,
  ],
};
