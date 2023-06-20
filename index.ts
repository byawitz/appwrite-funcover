import {Hono} from "hono";
import {runFunction} from "./inc/lib";

const defaultProject  = process.env.DEFAULT_PROJECT ?? '';
const defaultFunction = process.env.DEFAULT_FUNCTION ?? '';

const app = new Hono()

if (process.env.ALLOW_GLOBAL === 'true') {
    // Project and function route
    app.all('/:project/:functionId', async (c) => {
        return await runFunction(c.req.param().project, c.req.param().functionId, c);
    });

    if (process.env.PATH_AS_DATA === 'true') {
        app.all('/:project/:functionId/:pathData', async (c) => {
            return await runFunction(c.req.param().project, c.req.param().functionId, c, c.req.param().pathData);
        });
    }
}

// Default function
app.all('/', async (c) => {
    return await runFunction(defaultProject, defaultFunction, c);
});

if (process.env.PATH_AS_DATA === 'true') {
    app.all('/:pathData', async (c) => {
        return await runFunction(defaultProject, defaultFunction, c, c.req.param().pathData);
    });
}

// Error 404
app.all('*', (c) => {
    return c.json({'NotFound': true}, 404);
});

Bun.serve({
    port : 3000,
    fetch: app.fetch,
});
