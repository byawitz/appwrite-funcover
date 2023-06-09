async function runFunction(projectId: string, functionId: string, c: any) {
    const data     = await getData(c);
    const headers  = await getHeaders(c, projectId);
    const verbose  = process.env.VERBOSE === 'true';
    const endpoint = process.env.ENDPOINT ?? 'http://appwrite/v1';

    try {
        const res = await fetch(`${endpoint}/functions/${functionId}/executions`, {
            headers,
            verbose: verbose,
            method : 'POST',
            body   : JSON.stringify(data),

        })

        return response(res, c);
    } catch (e) {
        if (verbose) {
            console.log(e);
        }
        return {'error': true, message: 'general error occurs'};
    }
}

async function response(res: Response, c: any) {
    const json = await res.json() as any;

    switch (process.env.RETURN_TYPE) {
        case 'json':
            return c.json(JSON.parse(json.response ?? '{}') ?? {});
        case 'html':
            return c.html(json.response ?? '');
        case 'redirect':
            return Response.redirect(json.response ?? '');
        default:
            return c.json(json);
    }
}

async function getHeaders(c: any, projectId: string) {
    const headers = c.req.headers.toJSON();

    headers['Content-Type']       = 'application/json';
    headers['x-appwrite-project'] = projectId

    delete headers['content-type'];
    delete headers['accept-encoding'];
    delete headers['host'];

    return headers;
}

async function getData(c: any) {
    const data = {data: ''};

    if (c.req.method === 'POST') {
        const isJson         = (c.req.header('Content-Type') ?? '').indexOf('json') !== -1;
        const isFormOrEncode = (c.req.header('Content-Type') ?? '').indexOf('form') !== -1;

        if (isJson) {
            const json = await c.req.json();

            if (Object.values(json).length > 0) {
                data.data = getRawOrAll(json);
            }
        } else if (isFormOrEncode) {
            const body = await c.req.parseBody();

            if (Object.values(body).length > 0) {
                data.data = getRawOrAll(body);
            }
        } else {
            data['data'] = 'no_data';
        }
    } else if (c.req.query('data') !== undefined) {
        data['data'] = c.req.query('data');
    } else {
        data['data'] = 'no_data';
    }

    return data;
}

function getRawOrAll(data: any) {
    if (data.rawData !== undefined) {
        return data.rawData;
    }

    return JSON.stringify(data);
}

export {runFunction}