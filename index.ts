import {Hono} from "hono";
import {runFunction} from "./inc/lib";

const app = new Hono()

if (process.env.ALLOW_GLOBAL === 'true') {
    // Project and function route
    app.all('/:project/:functionId', async (c) => {
        const res = await runFunction(c.req.param().project, c.req.param().functionId, c);
        return c.json(res);
    });
}

// Default function
app.all('/', async (c) => {
    const res = await runFunction(process.env.DEFAULT_PROJECT ?? '', process.env.DEFAULT_FUNCTION ?? '', c);
    return c.json(res);
});

// Error 404
app.all('*', (c) => {
    return c.json({'NotFound': true}, 404);
});

Bun.serve({
    port: 3000,
    fetch: app.fetch,
});
