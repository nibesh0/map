import osmium
import geojson
from shapely.geometry import shape

class OSMHandler(osmium.SimpleHandler):
    def __init__(self):
        osmium.SimpleHandler.__init__(self)
        self.features = []

    def node(self, n):
        self.features.append(geojson.Feature(geometry=shape({
            "type": "Point",
            "coordinates": [n.location.lon, n.location.lat]
        }), id=n.id))

    def way(self, w):
        coordinates = [(n.lon, n.lat) for n in w.nodes]
        self.features.append(geojson.Feature(geometry=shape({
            "type": "LineString",
            "coordinates": coordinates
        }), id=w.id))

h = OSMHandler()
h.apply_file("central-zone-latest.osm.pbf")

feature_collection = geojson.FeatureCollection(h.features)

with open("output.geojson", "w") as f:
    geojson.dump(feature_collection, f)
