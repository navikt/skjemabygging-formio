import { Mottaksadresse } from "./Mottaksadresse";

export async function fetchMottaksadresser(baseUrl = ""): Promise<Mottaksadresse[]> {
  return await fetch(`${baseUrl}/mottaksadresser`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return [];
  });
}
