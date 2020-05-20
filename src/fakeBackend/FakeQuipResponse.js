export class QuipResponse {
    constructor(url) {
        this.url = url;
        this.responseStatus = {status: 200, statusText: 'OK'};
        this.responseHeaders = {};
    }

    headers(headers) {
        Object.entries(headers).forEach(([key, value]) => this.responseHeaders[key] = value);
        return this;
    }

    toFetchResponse() {
        return {
            ...this.responseStatus,
            headers: toLowerCasedMap(this.responseHeaders),
            ok: this.responseStatus.status < 400,
            url: this.url,
            json: () => Promise.resolve(this.jsonBody)
        };
    }

    json(jsonBody) {
        this.responseHeaders['content-type'] = 'application/json';
        this.jsonBody = JSON.parse(JSON.stringify(jsonBody));
    }

    created() {
        return this.status(201);
    }

    noContent() {
        return this.status(204);
    }

    notFound() {
        return this.status(404);
    }

    badRequest() {
        return this.status(400);
    }

    forbidden() {
        return this.status(403);
    }

    unauthorized() {
        return this.status(401);
    }

    status(code) {
        const codeToText = {
            200: 'Ok',
            201: 'Created',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Unauthorized',
            404: 'Not Found',
            500: 'Server Error'
        };
        this.responseStatus.status = code;
        this.responseStatus.statusText = (codeToText)[code];
        return this;
    }

    send(responseText) {
        // the response cannot be modified after this
        return null;
    }
}

const toLowerCasedMap = (object) => {
    const result = new Map();
    Object.keys(object).forEach(key => {
        result.set(key.toLowerCase(), object[key]);
    });
    return result;
};
