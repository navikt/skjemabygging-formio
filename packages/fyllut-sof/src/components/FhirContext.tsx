import React, { useEffect, useState } from 'react';
import Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { oauth2 } from 'fhirclient';
import { useLocation } from 'react-router-dom';

type ContextProps = {
    client: Client;
    patient: fhirclient.FHIR.Patient;
    user: fhirclient.FHIR.Practitioner;
    error: Error;
};
export const FhirContext = React.createContext<Partial<ContextProps>>({});

export const useFhirContext = function (): Partial<ContextProps> {
    const context = React.useContext(FhirContext);
    if (context === undefined) {
        throw new Error('useFhirContext must be used within a CountProvider');
    }
    return context;
};

export const FhirContextProvider = (props: any) => {
    const {pathname} = useLocation();
    const [client, setClient] = useState<Client>();
    const [patient, setPatient] = useState<fhirclient.FHIR.Patient>();
    const [user, setUser] = useState<fhirclient.FHIR.Practitioner>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        async function fetchData() {
            await oauth2.init({
                clientId: 'whatever-you-want',
                scope: 'launch launch/patient patient/read openid fhirUser user/read',
                completeInTarget: true,
                redirectUri: pathname,
            });
            const oauth2Client = await oauth2.ready();
            setClient(oauth2Client);
            if (oauth2Client) {
                const [patientRes, userRes] = await Promise.all([
                    oauth2Client.patient.read(),
                    oauth2Client.user.read(),
                ]);
                setPatient(patientRes);
                setUser(userRes as fhirclient.FHIR.Practitioner);
            }
        }

        fetchData().catch((e) => {
            setError(e);

            console.log(e.message, e);
        });
    }, [pathname]);

    const context = {
        client,
        error,
        patient,
        user,
    };
    return <FhirContext.Provider value={context}>{props.children}</FhirContext.Provider>;
};
