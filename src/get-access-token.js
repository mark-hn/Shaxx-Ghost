const axios = require('axios');
const dotenv = require('dotenv');

const config = require('./config.json');
const jsonfile = require('jsonfile');

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

async function get_access_token(authorization_code) {
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

    const headers = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    };

    // Send post request
    await axios
        .post(token_url, data, headers)
        .then((response) => {
            // Write access token and refresh token to config file
            config.accessToken = response.data.access_token
            config.refreshToken = response.data.refresh_token

            jsonfile.writeFile('./config.json', config)
                .then(res => {
                    console.log('Access token and refresh token written to config file.')
                })
                .catch(error => console.error(error))
        })
        .catch((error) => {
            console.error('Error:', error.response.data);
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
        });
}



// FUNCTION FOR REFRESHING THE ACCESS TOKEN

async function refresh_token(refresh_token) {
    const client_id = process.env.BUNGIE_CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const token_url = 'https://www.bungie.net/platform/app/oauth/token/';

    // Parameters of the post request
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('client_id', client_id);
    data.append('client_secret', client_secret);
    data.append('refresh_token', refresh_token);

    const headers = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    };

    // Send post request
    await axios
        .post(token_url, data, headers)
        .then((response) => {
            // Write new access token to config file
            config.accessToken = response.data.access_token;

            jsonfile.writeFile('./config.json', config)
                .then(res => {
                    console.log('Token refreshed and written to config file.')
                })
                .catch(error => console.error(error))
        })
        .catch((error) => {
            console.error('Error:', error.response.data);
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
        })
}



function main() {
    // console.log(get_authorization_url());
    // get_access_token('a52b92fd440432c7afc58a498bd8984d');
    refresh_token(config.refreshToken);
}
main();