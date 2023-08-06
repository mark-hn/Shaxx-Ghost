const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();

const sqlite3 = require('sqlite3').verbose();

const api_key = process.env.BUNGIE_API_KEY;
const base_url = 'https://www.bungie.net/Platform/';
access_token = process.env.ACCESS_TOKEN


// Function for reading item data from the Destiny Manifest SQLITE3

function getItemData(item_hash, db) {
    return new Promise((resolve, reject) => {
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
        });
    })
}



// Functions for accessing vendor inventories from the API

async function getXurInventory() {
    const xur_url = `https://www.bungie.net/Platform/Destiny2/3/Profile/${process.env.DESTINY_MEMBERSHIP_ID}/Character/${process.env.CHARACTER_ID}/Vendors/2190858386/?components=402`;

    // Headers of the get request
    const headers = {
        'X-API-Key': api_key,
        'Authorization': `Bearer ${access_token}`,
    };

    try {
        response = await axios.get(xur_url, { headers })
        const error_stat = response.data.ErrorStatus;
        console.log('Error status: ' + error_stat + '\n');

        // Extract item data from get request
        const items = response.data.Response.sales.data;

        let items_data = { 'weapons': [], 'armour': [] }
        for (let key in items) {
            // Obtain item data from manifest using item hash
            let item_hash = items[key].itemHash
            // Create a new database instance
            const db_path = 'manifest.sqlite3';
            const db = new sqlite3.Database(db_path);
            let item_data = await getItemData(item_hash, db);
            // Close the database connection
            db.close();

            if (typeof item_data != "undefined" && item_data.itemCategoryHashes.includes(1) && item_data.inventory.tierType == 6) {
                // Item is an exotic weapon
                let item = {};
                item['hash'] = item_hash;
                item['name'] = item_data.displayProperties.name;
                items_data.weapons.push(item);
            } else if (typeof item_data != "undefined" && item_data.itemCategoryHashes.includes(20) && item_data.inventory.tierType == 6) {
                // Item is an exotic armour piece
                let item = {};
                item['hash'] = item_hash;
                item['name'] = item_data.displayProperties.name;

                if (item_data.itemCategoryHashes.includes(21)) {
                    item['class'] = 'Warlock'
                } else if (item_data.itemCategoryHashes.includes(22)) {
                    item['class'] = 'Titan'
                } else if (item_data.itemCategoryHashes.includes(23)) {
                    item['class'] = 'Hunter'
                }

                items_data.armour.push(item);
            }
        }
        return items_data;
    } catch (error) {
        console.log('Error:', error.response ? error.response.status : error.message)

        // Checks if Xur is not present
        if (typeof error.response.data.ErrorStatus != 'undefined' && error.response.data.ErrorStatus === 'DestinyVendorNotFound') {
            return 'Xûr is currently on hiatus.';
        }
    }
}

async function getBansheeInventory() {
    const banshee_url = `https://www.bungie.net/Platform/Destiny2/3/Profile/${process.env.DESTINY_MEMBERSHIP_ID}/Character/${process.env.CHARACTER_ID}/Vendors/672118013/?components=402`

    // Headers of the get request
    const headers = {
        'X-API-Key': api_key,
        'Authorization': `Bearer ${access_token}`,
    };

    try {
        let response = await axios.get(banshee_url, { headers })
        const error_stat = response.data.ErrorStatus;
        console.log('Error status: ' + error_stat + '\n');

        // Extract item data from get request
        const items = response.data.Response.sales.data

        let items_data = []
        for (let key in items) {
            // Obtain item data from manifest using item hash
            let item_hash = items[key].itemHash
            // Create a new database instance
            const db_path = 'manifest.sqlite3';
            const db = new sqlite3.Database(db_path);
            let item_data = await getItemData(item_hash, db);
            // Close the database connection
            db.close();

            // Checks if the item is a weapon
            if (typeof item_data != "undefined" && item_data.itemCategoryHashes.includes(1)) {
                let item = { name: item_data.displayProperties.name, hash: item_hash, refreshDate: items[key].overrideNextRefreshDate };
                items_data.push(item);
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


// Exports the functions to be used in other files
module.exports = { getXurInventory, getBansheeInventory };
