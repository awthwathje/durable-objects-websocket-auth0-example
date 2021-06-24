<div style="text-align: center">
    <h1>🦀🔑 durable-objects-websocket-auth0-example</h1>
    <p>Cloudflare Workers, Durable Objects with WebSocket support and Auth0 authentication example project</p>
    <br>
</div>

This is a demo application powered by [Cloudflare edge technologies](https://www.cloudflare.com) with authentication provided by [Auth0](https://auth0.com) built for educational purposes.

## Structure
The project consists of two parts, which is a statically exported [Next.js](https://nextjs.org) front-end, powered by [Cloudflare Pages](https://pages.cloudflare.com) and [Cloudflare Workers](https://workers.cloudflare.com)-powered back-end.

Both parts are run and served [directly from the edge](https://www.cloudflare.com/learning/serverless/glossary/what-is-edge-computing).

## Prerequisites

To run project you will need an account and a paid Cloudflare Workers plan ($5/month), since Durable Objects are not included in the free plan yet. Also, Auth0 account is needed, and for low volume trafic a free plan is sufficient.

You will need [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com) installed locally. Note that Node.js is only used for development needs and will not run the production app. In the Cloudflare infrastructure, [V8 Isolates](https://developers.cloudflare.com/workers/learning/how-workers-works) are used instead, which is a modern replacement for Node in serverless. They provide zero cold start, time among other benefits.

## Auth0 configuration
After account is created, create an application of type "Native"

Take a note of the `Domain`, `Client ID` and `Client Secret` fields. You'll need them later. Enable `Refresh Token Rotation` option.

You will need to populate the allowed URLs as well.

Here is an **example**:

* Allowed Callback URLs: `https://yourdomain.com, https://yourdomain.com/api/auth/callback`: former for the client-side authentication, latter for the edge.
* Allowed Logout URLs: `https://yourdomain.com, https://yourdomain.com/api/auth/logout`: same.
* Allowed Web Origins: `https://yourdomain.com`: to prevent cross-origin related attacks.

## Cloudflare configuration
You will need to subscribe to the paid "Pay-as-you-go" plan to access Durable Objects beta. Once you purchased the subscription, activate the Durable Objects beta in the dashboard.

## Front-end: GitHub — Cloudflare Pages integration
First, you have to clone this repo and publish it on GitHub. This is required for Cloudflare Pages, a continuous delivery service. Note that this will only deploy front-end (statically exported Next.js app) and Workers will be handled differently. So you can leave `wrangler.toml.example` for now, since it's not used by the front-end.

Once you repo is published (it could be private), create a new Pages project in Cloudflare Dashboard. Follow the instructions and use `Next.js (static)` template near the end of a set up.

Once the Cloudflare Pages project is created, get to its `Settings` tab and go to the `Environment variables` section. The front-end makes use of 4 environment variables, which could be securely set here:

* `AUTH0_CLIENT_ID`: get it from your Auth0 app's page, normally a long string of random characters.
* `AUTH0_ISSUER_BASE_URL`: this is the "Domain" from the same page, like `yourapp.eu.auth0.com`.
* `AUTH0_REDIRECT_URI`: put the base URL of your project, like `https://yourdomain.com` or `your-app-dtf.pages.dev` if you don't have your own a domain (you can see the automatically generated domain on the "Deployments" tab).
* `WEB_SOCKET_URL`: this is the WebSocket URL which will be used for communication with the edge, like `wss://yourdomain.com/api/websocket`.

Once all the environment variables are set, you can try to deploy your application to see if the deployment works. You can push a commit and deployment will start automatically.

## Wrangler setup
Cloudflare Pages cannot take care of Workers and Durable Objects right now, so you'll need to manage them from the command line. You will use Wrangler for that. It's already in the project dependencies, but you will need to set it up before it could be used. Instructions to set Wrangler to use with your Cloudflare account [are here](https://developers.cloudflare.com/workers/cli-wrangler/authentication).

Once Wrangler is set up, fire `wrangler whoami` from the console. If you see your account's email, you're good to go to deploy Workers.

## Back-end: Workers & Durable Objects
Rename `wrangler.toml.example` to `wrangler.toml` and fill all the missing parts.

If you don't have custom domain, leave the `workers_dev = false`.

Environment variables are set in `vars` section. Almost all of them are the same as for the front-end, with the addition of `AUTH0_CLIENT_SECRET`, which is only needed on the edge. You can find it in your app's Auth0 dashbord.

`SALT` variable is also required, you can generate a random value using Cloudflare's https://csprng.xyz/v1/api service and save the env to the edge using the following command: 
```
wrangler secret put SALT
```

That concludes the env variables settings.

To populate the `kv_namespaces` section, you will need to create [Workers KV](https://www.cloudflare.com/products/workers-kv) namespace first. It will be used to store auth information on the edge, which is needed to protect your API from unauthorized access.

Issue the following command from a terminal:
```
wrangler kv:namespace create AUTH_STORE
```
You will be presented with the complete `kv_namespaces` field, which you can copy and paste into your config.

Once the Wrangler config is set, you are ready to deploy your Worker and Durable Object. There are some handy scripts in the `package.json`:

* `yarn publish:workers:new-classes`: used to deploy Workers and **introduce** new Durable Objects to the edge (for the first time).
* `yarn publish:workers`: used to **update** the deployment, when Durable Objects are already present on the edge.

You can check other scripts like `format` and `lint`, which are pretty self-explanatory.

## The API
Workers code has a few API endpoints hardcoded.

The following ones are for authentication purposes:
* `/api/auth/login`
* `/api/auth/logout`
* `/api/auth/status`
* `/api/auth/callback`

The only endpoint used to talk to Durable Objects is:
* `/api/websocket`

When you are using WebSocket, the need for multiple endpoints is low.

## Notes
The project doesn't fully work locally yet. In order to get environment variable for the Next.js, you can create `.env.development.local` file and put values from the Auth0 dashboard for your **development** Auth0 app (not production). Workers do not work locally yet.

`"module": "./dist/shim.mjs"` in the `package.json` is crucial for Workers deployment and is ignored during Next.js build phase.

## What's next?
This is a good way to serverless on the edge right now, but it will be even better once Cloudlfare Workers will support SSR (server-side rendered) applications and Node.js API shimming. Which will make possible to use the platform to run Next.js SSR apps with third-party dependencies which rely on Node.js APIs.

This project (and many others) will definitely benefit from being able to use [auth0/nextjs-auth0](https://github.com/auth0/nextjs-auth0) on the edge, since it will simplify and strengthen authentication.

## References & inspiration
The Auth0 integration part is taken from [signalnerve/workers-auth0-example](https://github.com/signalnerve/workers-auth0-example).

CommonJS/Webpack setup is as suggested by [cloudflare/durable-objects-webpack-commonjs](https://github.com/cloudflare/durable-objects-webpack-commonjs).

Durable Object / WebSocket implementation is heavily inspired by [cloudflare/workers-chat-demo](https://github.com/cloudflare/workers-chat-demo).