import json


def parse(infile, outfile, savedKeys, rename=False):
    data = {}
    with open(infile) as json_file:
        data = json.load(json_file)
        for store in data:
            for key in list(store):
                if key not in savedKeys:
                    del store[key]
            if rename:
                store['latitude'] = store.pop('Address.Latitude')
                store['longitude'] = store.pop('Address.Longitude')

    with open(outfile, 'w') as out:
        json.dump(data, out)


parse('walmart_extended.json', 'walmart.json', {'latitude', 'longitude'})
parse('target_extended.json', 'target.json', {'Address.Latitude', 'Address.Longitude'}, True)
