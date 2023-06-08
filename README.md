# Appwrite Funcover

> Right before Appwrite's [releasing](https://github.com/appwrite/appwrite/discussions/5016) next gen (4) of their functions, You can cover your Appwrite function with a dedicated endpoint!

With Funcover you can `cover` your function with domain you want. That means that you'll be able to access your [Appwrite functions](https://appwrite.io/docs/functions) one or all of them using and endpoint you want.

This feature will help you use Appwrite as a target-webhook, direct access without the need to provide project id, And also simply, for your convince.

## Funcover is built with:

- [Bun](https://bun.sh/) _(Because I like it)_ - A fast all-in-one JavaScript runtime.
- [Hono](https://hono.dev/) - Simple, ultrafast web framework.
- TypeScript - I'm speechless :wink:

## Funcover features

- [x] Access your Appwrite function through a GET request.
- [x] User your Appwrite function as a WebHook.
- [x] Passing all request headers.
- [x] Passing all request Body/Form/Json data.
- [x] Passing `data` query variable in GET requests.
- [x] Can be used for single or all of your functinos.
- [ ] Passing API Key.

## Installation

Funcover meant to be added to your current [self-hosted](https://appwrite.io/docs/self-hosting) Appwrite instance.

#### SSL

Before adding Funcover you'll need make sure the domain you're planning to use will have SSL, To do so we're harnessing Appwrite [custom-domain](https://appwrite.io/docs/custom-domains) feature.

After adding your domain as custom-domain to any of your Appwrite project, and, the domain is now pointing to your Appwrite instance you can move to the next step.

#### Adding Funcover.

SSH into your server and edit your `docker-compose.yml` file.

At the bottom of the file right after the `telegraph` service, and, right before the `networks` section add the following.

```yaml
  funcover:
    image: boolcode/appwrite-funcover:0.0.1
    container_name: funcover
    restart: unless-stopped
    environment:
      - ALLOW_GLOBAL=true
      - DEFAULT_PROJECT=yourDefaultProjectID
      - DEFAULT_FUNCTION=yourDefaultFunctionID
    networks:
      - appwrite
      - gateway
    labels:
      - traefik.enable=true
      - traefik.constraint-label-stack=appwrite
      - traefik.docker.network=appwrite
      - traefik.http.services.funcover.loadbalancer.server.port=3000
      - traefik.http.routers.funcover-http.entrypoints=appwrite_web
      - traefik.http.routers.funcover-http.rule=Host(`custom.domain.com`) && PathPrefix(`/`)
      - traefik.http.routers.funcover-http.service=funcover
      - traefik.http.routers.funcover-https.entrypoints=appwrite_websecure
      - traefik.http.routers.funcover-https.rule=Host(`custom.domain.com`) && PathPrefix(`/`)
      - traefik.http.routers.funcover-https.service=funcover
      - traefik.http.routers.funcover-https.tls=true
```

Replace `custom.domain.com` with your newly attached custom-domain.

Look [here](docker-compose.yml) for a complete example.

<details>
<summary>What is going on that snippet, what we just did??</summary>

We have added a new service into docker-compose, and this is a quick overview of the fields.

- image - The name of the Docker image we are using for this service.
- container_name - The name of the container. useful for logs and monitoring.
- restart - Container restart policy. We have set it to `unless-stopped` so unless we're stopping it Docker will make sure the service is on.
- environment - Here we're passing some values to be handled by Funcover at runtime. This is the best way to customize docker images without the need to rebuild them.
- networks - Here we're connecting Funcover to `appwrite` network.
- labels - Labels are piece of information that can be used by other containers in our case the `traefik` one.

Do notice the service rule (for http & https)

```
.rule=Host(`custom.domain.com`) && PathPrefix(`/`)
```

We are setting two conditions for the rule.

1. Host - We want to match the host to access Funcover.
2. PathPrefix - Adding this part is important for the case we want Funcover to be able to parse all requests with no routes.

_**Be aware** that when you're upgrading Appwrite this addition will be erased._
</details>

Now it's time to reload our Docker Compose environment.

```shell
docker compose up -d
```

### Usages

Now any time you'll access the custom domain your default function in you default project will run and, will return back the execution JSON. Just like you've used the [createExecution](https://appwrite.io/docs/client/functions?sdk=web-default#functionsCreateExecution) function.

```json
{
  "$id": "5e5ea5c16897e",
  "$createdAt": "2020-10-15T06:38:00.000+00:00",
  "$updatedAt": "2020-10-15T06:38:00.000+00:00",
  "$permissions": [
    "any"
  ],
  "functionId": "5e5ea6g16897e",
  "trigger": "http",
  "status": "processing",
  "statusCode": 0,
  "response": "",
  "stdout": "",
  "stderr": "",
  "duration": 0.4
}
```

Passing data to the function can be done in any of the follow four ways.

1. GET `data` variable. `https://custom.domain.com/?data=repoReload`
2. POST using raw data with `application/json` content type.
3. POST using form-data.
4. POST using application/x-www-form-urlencoded.

In request of type POST Funcover will check first for raw JSON data before checking for `form-data` or `application/x-www-form-urlencoded`.

In any of the POST request you can use a filed named `rawData` to pass data directly to `data` key. Here's an example in JSON

```json
{
  "rawData": "I'm piece of data"
}
```

This data will be sent to the function like so:

```json
{
  "data": "I'm piece of data"
}
```

As in any other case, that for example:

```json
{
  "data": "I'm piece of data"
}
```

This data will be sent to the function completely, like so:

```json
{
  "data": "{\"data\":\"I'm piece of data\"}"
}
```

#### Logs

Funcover don't produce any logs at runtime. In case you want to debug Funcover steps or you just want to know more you can pass the `VERBOSE` environment variable in the `docker-compose.yml` file.

Then you'll be able to see the logs by running

```shell
docker logs funcover
```

You can add the `-f` flag to follow the log output.

#### Global

Funcover can be used for a single function by setting the `DEFAULT_PROJECT` & `DEFAULT_FUNCTION` variables.

Also, Funcover can be used to handle all of your functions by project and function ID.

To do so you'll need to set the `ALLOW_GLOBAL` variable as `true` and reloading your Docker Compose environment.

Now you'll be able to access any of your functions with the following route.

```
https://custom.domain.com/projectId/functionId/
```

You can use pass the data and use this endpoint as the first one.

#### Multiple instances.

In case you like to use Funcover on single mode, and/or you want to have multiple Funcover instances you can do so.

In the attached [example](docker-compose.yml) you can see how to set a second Funcover by looking on the `funcover-second` service.

#### Rate limiting & Permissions

As of now Funcover uses the [REST](https://appwrite.io/docs/rest) [Client-side](https://appwrite.io/docs/sdks#client) SDK that mean that each function will hit their client rate-limit after 60 execution in a given minute.

For most use-cases that will more than enough.

Also, because Funcover execute the function through Client-side, Make sure you're adding Any execution for your function permissions.

### Environment variables

_You can take a look at [.env.example](.env.example) for possible values_

#### `VERBOSE`

When sets to `true` Funcover will produce more logs at runtime.

#### `ALLOW_GLOBAL`

When sets to `true` Funcover will handle all of your function by project id.

#### `ENDPOINT`

Set as your Appwrite endpoint.

Funcover will work even if you didn't provide and endpoint, As Funcover will access the main Appwrite container through Docker-network internal host name `http://appwrite/v1`.

#### `DEFAULT_PROJECT`

Set as your default Appwrite project ID.

#### `DEFAULT_FUNCTION`

Set as your default Appwrite function ID.