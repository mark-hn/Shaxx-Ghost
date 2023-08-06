const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();


// FUNCTION FOR GETTING THE AUTHORIZATION URL:

function get_authorization_url() {
    const client_id = process.env.BUNGIE_CLIENT_ID;
    const redirect_url = 'https://webhook.site/2631d643-5d1d-4029-977b-776b4a3c7335';
    const authorization_url = 'https://www.bungie.net/en/OAuth/Authorize';

    // Parameters of the URL
    const authParams = new URLSearchParams({
        client_id: client_id,
        response_type: 'code',
        redirect_uri: redirect_url,
    });

    const authUrl = `${authorization_url}?${authParams.toString()}`;

    return `Authorization URL: ${authUrl}`;
    // Open the returned URL and the authorization code will be in the query string of the redirect URL
}



// FUNCTION FOR GETTING THE ACCESS TOKEN:

function get_access_token(authorization_code) {
    const client_id = process.env.BUNGIE_CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_url = 'https://webhook.site/2631d643-5d1d-4029-977b-776b4a3c7335';

    const token_url = 'https://www.bungie.net/platform/app/oauth/token/';

    // Parameters of the post request
    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('code', authorization_code);
    data.append('redirect_uri', redirect_url);

    const config = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    };

    axios
        .post(token_url, data, config)
        .then((response) => {
            console.log(response.data)
            console.log("Access token:", response.data.access_token)
            console.log("Refresh token:", response.data.refresh_token)
        })
        .catch((error) => {
            console.error('Error:', error.response.data);
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
        });
}



// FUNCTION FOR REFRESHING THE ACCESS TOKEN

function refresh_token(refresh_token) {
    const client_id = process.env.BUNGIE_CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const token_url = 'https://www.bungie.net/platform/app/oauth/token/';

    // Parameters of the post request
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('refresh_token', refresh_token);

    const config = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    };

    axios
        .post(token_url, data, config)
        .then((response) => {
            console.log("Token refreshed.");
            console.log("Access token:", response.data.access_token)
        })
        .catch((error) => {
            console.error('Error:', error.response.data);
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
        })
}



function main() {
    // console.log(get_authorization_url());
    // get_access_token('[insert authorization code]');
    refresh_token(process.env.REFRESH_TOKEN);
}
main();