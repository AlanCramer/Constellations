
"""
Create a search index for the stars.csv file allowing users to search for stars by name. 

"""

import pandas as pd
import json
from typing import Optional


def load_star_data(filename: str = "stars1000.csv") -> Optional[pd.DataFrame]: #this means load a pandas dataframe or none if it fails. 
    """Load star data from a CSV file.
    
    Args:
        filename: Path to the CSV file containing star data
        
    Returns:
        pandas DataFrame with columns: name, hr, ra, dec, mag, or None if loading fails
    """
    try:
        df = pd.read_csv(filename)
        print(f"Loaded {len(df)} stars from {filename}")
        return df
    except FileNotFoundError:
        print(f"Error: File {filename} not found")
        return None
    except Exception as e:
        print(f"Error loading data {e}")
        return None


##need to build a search index for the star data. 
#using a dictionary or hash table to keep search time low. 

#creating a dictionary like this: (this is much faster than a list since it has the key)
#{"sirius": {name: "Sirius", hr: 2491, ra: 6.75, dec: -16.71, mag: -1.44}}

def create_search_index(stars_df):
    #create a dictionary to store the star data. 
    search_index = {} #creates an empty dictionary. 

    #loop through the dataframe and add the star data to the dictionary. 
    for index, row in stars_df.iterrows():
        #index is the row number (0, 1, 2...)
        #row = the actual data for the star. 
        star_name = row['name'] #star_name = the name of the star per row. This means get the name of the star from the row. 
        
        if pd.isna(star_name) or star_name == '':
            #print(f"Skipping star {index} because it has no name")
            continue #skip the star if it has no name. 
        
        star_name_lower = star_name.lower() #convert that star_name to lowercase. 
        search_index[star_name_lower] = row #this makes star_name_lower the row or the key. This means the key is the name of the star in lowercase now. 

    return search_index #give us the results 



""" 
To add: 
-how to handle partial matches, if they type a partial match it can suggest the correct star or stars.
-how to handle "not found" stars. (plus a note, if this is a real star tell the developers and we will get it added to our database! (which is currently a csv :D) 
-
"""

def search_star(search_index, query):
    """Search for a star by name """
    query_lower = query.lower().strip()  #clean up their input. 

    if query_lower in search_index:
        #Yay we found the star!
        star_data = search_index[query_lower]
        print(f"Found star: {star_data['name']}")
        return star_data
    else:
         # Not found
        print(f"Star '{query}' not found in our database.")
        print("But hey, if it's a real star, tell the developers and we'll add it to our database! (our massive CSV :D)")
        return None

def save_search_index(search_index, filename = "search_index.json"):
    """Save the search index to a JSON file for the app to use (that's what javascript reads) """

    json_index = {}
    for name, star_data in search_index.items():


        json_index[name] = {
            "name": star_data['name'],
            "hr": star_data['hr'],
            "ra": star_data['ra'],
            "dec": star_data['dec'],
            "mag": star_data['mag']
        }
    
    # Save to both data and public directories
    with open(f"../data/{filename}", 'w') as f:
        json.dump(json_index, f, indent=2)
    
    with open(f"../public/{filename}", 'w') as f:
        json.dump(json_index, f, indent=2)
    
    print(f"Search index saved to {filename}")




def main(): 
    print("Building star search index...")

    stars_df = load_star_data()
    if stars_df is None:
        print("Failed to load star data. Exiting.")
        return

    print(f"Successfully loaded {len(stars_df)} stars")

    search_index = create_search_index(stars_df)
    print(f"Created search index with {len(search_index)} stars")
    
    search_star(search_index, "Sirius")
    search_star(search_index, "Applepie")

    save_search_index(search_index, "search_index.json")
    print("Search index saved to search_index.json")

if __name__ == "__main__":
    main()