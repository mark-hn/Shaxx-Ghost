const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();

const sqlite3 = require('sqlite3').verbose();

const api_key = process.env.BUNGIE_API_KEY;
const base_url = 'https://www.bungie.net/Platform/';
access_token = process.env.ACCESS_TOKEN


// Function for reading item data from the Destiny Manifest SQLITE3

function getItemData(item_hash) {
    const db_path = 'manifest.sqlite3';
    // Create a new database instance

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(db_path);

        // Perform a SELECT query
        db.all(`SELECT * FROM DestinyInventoryItemDefinition WHERE id + 4294967296 = ${item_hash} OR id = ${item_hash}`, (err, rows) => {
            if (err) {
                reject('Error executing query:', err);
            } else {
                if (rows.length > 0) {
                    // Process the rows returned by the query
                    rows.forEach(row => {
                        // Convert string in json column to a json
                        const json_data = JSON.parse(row.json);
                        resolve(json_data);
                    });
                } else {
                    resolve('Item not found.');
                }
            }
            // Close the database connection
            db.close();
        });
    })
}



// Functions for accessing vendor inventories from the API

async function getXurInventory() {
    const xur_url = `https://www.bungie.net/Platform/Destiny2/3/Profile/${process.env.DESTINY_MEMBERSHIP_ID}/Character/${process.env.CHARACTER_ID}/Vendors/2190858386/?components=402`;

    // headers of the get request
    const headers = {
        'X-API-Key': api_key,
        'Authorization': `Bearer ${access_token}`,
    };

    try {
        response = await axios.get(xur_url, { headers })
        const error_stat = response.data.ErrorStatus;
        console.log('Error status: ' + error_stat + '\n');
    } catch (error) {
        console.error('Error:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Status Text:', error.response.statusText);

        // checks if Xur is not present
        if (error.response.data.ErrorStatus === 'DestinyVendorNotFound') {
            return 'Xûr is currently on hiatus.';
        }
    }
}

async function getBansheeInventory() {
    const banshee_url = `https://www.bungie.net/Platform/Destiny2/3/Profile/${process.env.DESTINY_MEMBERSHIP_ID}/Character/${process.env.CHARACTER_ID}/Vendors/672118013/?components=402`

    // headers of the get request
    const headers = {
        'X-API-Key': api_key,
        'Authorization': `Bearer ${access_token}`,
    };

    try {
        let response = await axios.get(banshee_url, { headers })
        const error_stat = response.data.ErrorStatus;
        console.log('Error status: ' + error_stat + '\n');

        // extract item data from get request
        const items = response.data.Response.sales.data
        let items_data = {}
        for (let key in items) {
            let item_hash = items[key].itemHash
            let item_data = await getItemData(item_hash);

            // checks if the item is a weapon
            if (typeof item_data != "undefined" && item_data.itemCategoryHashes.includes(1)) {
                items_data[item_data.displayProperties.name] = items[key].overrideNextRefreshDate;
            }
        }
        return items_data;
    } catch (error) {
        return 'Error:', error.response ? error.response.status : error.message;
    }
}



// Function for accessing vendor inventories from the manifest

function getVendorData(vendor_hash) {
    const db_path = 'manifest.sqlite3';
    // Create a new database instance

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(db_path);

        // Perform a SELECT query
        db.all(`SELECT * FROM DestinyVendorDefinition WHERE id + 4294967296 = ${vendor_hash} OR id = ${vendor_hash}`, (err, rows) => {
            if (err) {
                reject('Error executing query:', err);
            } else {
                if (rows.length > 0) {
                    // Process the rows returned by the query
                    rows.forEach(row => {
                        // Convert string in json column to a json
                        const json_data = JSON.parse(row.json);
                        resolve(json_data);
                    });
                } else {
                    resolve('Vendor not found.');
                }
            }
            // Close the database connection
            db.close();
        });
    })
}

async function main(){
    console.log(await getBansheeInventory());
}

// Exports the functions to be used in other files
module.exports = { getXurInventory, getBansheeInventory };
