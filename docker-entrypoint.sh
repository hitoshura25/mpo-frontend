#!/bin/sh
# Print environment variables for debugging (without exposing secrets)
echo "OAUTH_AUTHORITY is set: $([ -n "$OAUTH_AUTHORITY" ] && echo 'YES' || echo 'NO')"
echo "OAUTH_CLIENT_ID is set: $([ -n "$OAUTH_CLIENT_ID" ] && echo 'YES' || echo 'NO')"
echo "OAUTH_REDIRECT_URI is set: $([ -n "$OAUTH_REDIRECT_URI" ] && echo 'YES' || echo 'NO')"
echo "OAUTH_POST_LOGOUT_REDIRECT_URI is set: $([ -n "$OAUTH_POST_LOGOUT_REDIRECT_URI" ] && echo 'YES' || echo 'NO')"

# Create a JavaScript file to inject environment variables
cat << EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  OAUTH_AUTHORITY: "${OAUTH_AUTHORITY:-}",
  OAUTH_CLIENT_ID: "${OAUTH_CLIENT_ID:-}",
  OAUTH_REDIRECT_URI: "${OAUTH_REDIRECT_URI:-}",
  OAUTH_POST_LOGOUT_REDIRECT_URI: "${OAUTH_POST_LOGOUT_REDIRECT_URI:-}",
};
console.log("Environment variables loaded from env-config.js");
EOF

echo "Environment variables have been injected into env-config.js"
# Execute the command passed to docker run
exec "$@"