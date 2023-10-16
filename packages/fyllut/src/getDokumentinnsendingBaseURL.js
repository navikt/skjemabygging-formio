export default function getDokumentinnsendingBaseURL(naisClusterName) {
  const dokumentinnsendingProdURL = 'https://tjenester.nav.no/dokumentinnsending';
  const dokumentinnsendingDevURL = 'https://tjenester-q0.nav.no/dokumentinnsending';

  if (naisClusterName === 'prod-gcp') {
    return dokumentinnsendingProdURL;
  } else if (naisClusterName === 'dev-gcp' || naisClusterName === 'labs-gcp') {
    return dokumentinnsendingDevURL;
  } else {
    console.log(`Can't detect naiscluster, defaulting to ${dokumentinnsendingProdURL}`);
    return dokumentinnsendingProdURL;
  }
}
