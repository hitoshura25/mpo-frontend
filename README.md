# MPO Frontend - WebAssembly Podcast Player
A web-based podcast player application that uses WebAssembly for audio processing.

*Disclaimer*: Used various AI Co-pilot Tools (Amazon Q, Gemini 2.0 Flash, Claude 3.5 Sonnet)

## Features

- Audio playback with WebAssembly processing
- Podcast episode listing and management
- Playback controls (play, pause, skip, speed control)
- Responsive design for mobile and desktop

## Technology Stack
- Frontend: HTML, CSS, JavaScript
- WebAssembly: Rust with wasm-bindgen
- Build tools: wasm-pack, npm

## Development

### Prerequisites

- Rust and Cargo
- Node.js and npm
- wasm-pack

### Setup
*Note*: This requires an OAuth provider to be configured, see environment variables for the Docker section for more info. For local dev, these will need to be in a ".env" file.

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Build the Web Assembly module and serve the app via Webpack
   ```
   npm run start
   ```

4. Alternatively, to use the supplied mock oauth server locally run this script
   ```
   npm run start:dev
   ```
5. To run e2e tests
   ```
   npm run test:e2e
   ```

### Docker
*Note*: Docker image must be run as user uuid 1000

## Install Docker
https://www.docker.com/get-started/

## Create a buildx builder (if not already created)
`docker buildx create --use --name mybuilder`

## Build the image
`docker buildx build -t mpo-frontend:latest --load .`

## Run
```
OAUTH_AUTHORITY="<OAuth Authority>"
OAUTH_CLIENT_ID="<OAuth client id>"
OAUTH_REDIRECT_URI="<OAuth redirect uri>"
OAUTH_POST_LOGOUT_REDIRECT_URI="<OAuth logout redirect uri>"

docker run -p 8080:80 -e OAUTH_AUTHORITY=$OAUTH_AUTHORITY -e OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID -e OAUTH_REDIRECT_URI=$OAUTH_REDIRECT_URI -e OAUTH_REDIRECT_URI=$OAUTH_REDIRECT_URI -e OAUTH_POST_LOGOUT_REDIRECT_URI=$OAUTH_POST_LOGOUT_REDIRECT_URI  mpo-frontend
```
## License

See the LICENSE file for details.