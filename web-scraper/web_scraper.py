from bs4 import BeautifulSoup
import requests
import pandas as pd

data = []

for i in range(1, 26):
    # obtaining the HTML text from the website
    html_text = requests.get(f'https://www.light.gg/db/all/?page={i}&f=-41,-42,-43,20,30(1;2;3)').text
    soup = BeautifulSoup(html_text, 'lxml')

    # obtaining a collection of items
    items = None
    if soup.find('div', class_ = 'item-row item-row-7') is not None:
        items = soup.find_all('div', class_ = 'item-row item-row-7')
    elif soup.find('div', class_ = 'item-row item-row-6') is not None:
        if items is None:
            items = soup.find_all('div', class_ = 'item-row item-row-6')
        else:
            items += soup.find_all('div', class_ = 'item-row item-row-6')

    # iterating through the collection of items
    for item in items:
        # extracting data from the item
        if item.find('a', class_ = 'text-exotic') is not None:
            item_name = item.find('a', class_ = 'text-exotic').text
        elif item.find('a', class_ = 'text-legendary') is not None:
            item_name = item.find('a', class_ = 'text-legendary').text
        elif item.find('a', class_ = 'text-rare') is not None:
            item_name = item.find('a', class_ = 'text-rare').text
        elif item.find('a', class_ = 'text-basic') is not None:
            item_name = item.find('a', class_ = 'text-basic').text

        other_info = item.find_all('div', class_ = 'hidden-xs')
        item_data = [i.text.replace(' ', '').replace('\r', '').replace('\n', '') for i in other_info]
        if (item_data[0] != '-') and (item_data[0] != 'Titan') and (item_data[0] != 'Hunter') and (item_data[0] != 'Warlock'):
            item_data.insert(0, '-')
        item_class, item_rarity, item_slot, item_type = item_data[0], item_data[1], item_data[2], item_data[3]

        if (len(item_data[4]) == 6) or (item_data[4].find('.') == 1):
            pve_rating, pvp_rating = item_data[4][:3], item_data[4][3:]
        elif item_data[4].find('.') == 2:
            pve_rating, pvp_rating = item_data[4][:1], item_data[4][1:]
        else:
            pve_rating, pvp_rating = item_data[4][0], item_data[4][1]

        item_link = 'https://www.light.gg' + item.find('div', class_ = 'item show-hover item-icon').find('a').get('href')

        item_img = item.find('div', class_ = 'item show-hover item-icon').find('a').find('img').get('src')

        data_single_item = [item_name, item_class, item_rarity, item_slot, item_type, pve_rating, pvp_rating, item_link, item_img]
        data.append(data_single_item)

df = pd.DataFrame(data, columns=['Name', 'Class', 'Rarity', 'Slot', 'Type', 'PVE Rating', 'PVP Rating', 'Link', 'Image'])
df.to_csv('item-data.csv')