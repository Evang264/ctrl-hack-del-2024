import osmnx as ox
import folium
import csv

# Define your area and download the graph and greenery data
location = "43.471278, -80.543038"
graph = ox.graph_from_place(location, network_type="walk")
greenery = ox.features_from_place(location, tags={"natural": "tree"})

# Project the graph and greenery data to ensure they are compatible
graph_projected = ox.project_graph(graph)
greenery_projected = greenery.to_crs(graph_projected.graph["crs"])

# Convert the walking network to GeoJSON format for folium
nodes, edges = ox.graph_to_gdfs(graph_projected)
edges_geojson = edges.to_crs(epsg=4326).to_json()  # Convert to WGS84 for folium

# Initialize the Folium map at the location's center
map_center = [43.4643, -80.5204]  # Waterloo coordinates
m = folium.Map(location=map_center, zoom_start=14, tiles="OpenStreetMap")

# Plot walking paths from edges data (converted to GeoJSON)
folium.GeoJson(
    edges_geojson, style_function=lambda x: {"color": "blue", "weight": 2}
).add_to(m)

# Plot tree locations as points
with open("../frontend/public/trees.csv", "w", newline="") as csvfile:
    coord_writer = csv.writer(csvfile)
    coord_writer.writerow(["Latitude", "Longitude"])

    for _, row in greenery_projected.to_crs(
        epsg=4326
    ).iterrows():  # Convert to WGS84 for folium
        if row.geometry.geom_type == "Point":
            lat, lon = row.geometry.y, row.geometry.x
            if -80.531845 >= lon >= -80.558181 and 43.478606 >= lat >= 43.464190:
                coord_writer.writerow([lat, lon])
                folium.CircleMarker(
                    location=[row.geometry.y, row.geometry.x],
                    radius=5,
                    color="green",
                    fill=True,
                    fill_opacity=0.6,
                ).add_to(m)

    m.save("waterloo_shade_map.html")
