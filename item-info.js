const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();

async function getItemInformation(apiKey, itemName) {
    const baseUrl = 'https://www.bungie.net/Platform';
    const headers = { 'X-API-Key': apiKey };

    // obtain JSON data from Manifest/DestinyInventoryItemDefinition
    try {
        // Search for the item
        const searchUrl = `${baseUrl}/Destiny2/Armory/Search/DestinyInventoryItemDefinition/${itemName}/`;
        const searchResponse = await axios.get(searchUrl, { headers });
        const searchResults = searchResponse.data.Response.results.results;

        if (searchResults.length > 0) {
            for (let i = 0; i < searchResponse.data.Response.results.totalResults; i++) {
                if (searchResults[i].displayProperties.name.toUpperCase() === itemName.toUpperCase()) {
                    const itemHash = searchResults[i].hash;
                    // Retrieve item information using the hash value
                    const itemUrl = `${baseUrl}/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}`;
                    const itemResponse = await axios.get(itemUrl, { headers });
                    const itemData = itemResponse.data.Response;

                    // check if item is a weapon or armour piece
                    if (itemData.itemCategoryHashes.includes(1) || itemData.itemCategoryHashes.includes(20)) {
                        // clean item data
                        cleanData = cleanItemInformation(itemData);
                        return cleanData;
                    }
                }
            }
            return 'Item not found.';
        } else {
            return 'Item not found.';
        }
    } catch (error) {
        return 'Error:', error.response ? error.response.status : error.message;
    }
}

function cleanItemInformation(itemData) {
    // extract item data from JSON
    let cleanData = {};
    cleanData['itemName'] = itemData.displayProperties.name;
    cleanData['itemIcon'] = itemData.displayProperties.icon;
    cleanData['itemDescription'] = itemData.flavorText;
    cleanData['itemType'] = itemData.itemTypeAndTierDisplayName;
    cleanData['itemRarity'] = itemData.inventory.tierTypeName;

    if (itemData.itemType === 3) { // item is a weapon
        cleanData['itemCategory'] = 'Weapon';
        
        // extract item slot
        if (itemData.equippingBlock.equipmentSlotTypeHash === 953998645) {
            cleanData['itemSlot'] = 'Power';
        } else if (itemData.equippingBlock.equipmentSlotTypeHash === 2465295065) {
            cleanData['itemSlot'] = 'Energy';
        } else if (itemData.equippingBlock.equipmentSlotTypeHash === 1498876634) {
            cleanData['itemSlot'] = 'Kinetic';
        }

        // extract item damage
        if (itemData.damageTypes[0] === 1) {
            cleanData['itemDamage'] = 'Kinetic';
        } else if (itemData.damageTypes[0] === 2) {
            cleanData['itemDamage'] = 'Arc';
        } else if (itemData.damageTypes[0] === 3) {
            cleanData['itemDamage'] = 'Solar';
        } else if (itemData.damageTypes[0] === 4) {
            cleanData['itemDamage'] = 'Void';
        } else if (itemData.damageTypes[0] === 5) {
            cleanData['itemDamage'] = 'Raid';
        } else if (itemData.damageTypes[0] === 6) {
            cleanData['itemDamage'] = 'Stasis';
        } else if (itemData.damageTypes[0] === 7) {
            cleanData['itemDamage'] = 'Strand';
        }
    } else if (itemData.itemType === 2) { // item is an armour piece
        cleanData['itemCategory'] = 'Armour';
        
        // extract item slot
        if (itemData.itemCategoryHashes[1] === 45) {
            cleanData['itemSlot'] = 'Helmet';
        } else if (itemData.itemCategoryHashes[1] === 46) {
            cleanData['itemSlot'] = 'Arms';
        } else if (itemData.itemCategoryHashes[1] === 47) {
            cleanData['itemSlot'] = 'Chest';
        } else if (itemData.itemCategoryHashes[1] === 48) {
            cleanData['itemSlot'] = 'Legs';
        } else if (itemData.itemCategoryHashes[1] === 49) {
            cleanData['itemSlot'] = 'Class Item';
        }

        // extract item class
        if (itemData.itemCategoryHashes[0] === 21) {
            cleanData['itemClass'] = 'Warlock';
        } else if (itemData.itemCategoryHashes[0] === 22) {
            cleanData['itemClass'] = 'Titan'
        } else if (itemData.itemCategoryHashes[0] === 23) {
            cleanData['itemClass'] = 'Hunter'
        }
    }
    cleanData['hash'] = itemData.hash
    return cleanData;
}


// Exports the functions to be used in other files
module.exports = getItemInformation;
