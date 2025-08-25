export async function getAreaCodes(baseUrl = ''): Promise<any[]> {
  return fetch(`${baseUrl}/api/common-codes/area-codes`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw Error('Failed to fetch retningsnumre');
  });
}
