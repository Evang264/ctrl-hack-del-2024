import osmnx as ox
import folium
import geopandas as gpd

# Define your area and download the graph and greenery data
location = "Waterloo, Ontario, Canada"
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
for _, row in greenery_projected.to_crs(
    epsg=4326
).iterrows():  # Convert to WGS84 for folium
    if row.geometry.geom_type == "Point":
        folium.CircleMarker(
            location=[row.geometry.y, row.geometry.x],
            radius=2,
            color="green",
            fill=True,
            fill_opacity=0.6,
        ).add_to(m)
    elif row.geometry.geom_type == "Polygon":
        # Add larger tree clusters as polygons if they exist
        folium.GeoJson(
            row.geometry.__geo_interface__,
            style_function=lambda x: {"color": "green", "weight": 1},
        ).add_to(m)

# Save the map to an HTML file and display it
m.save("waterloo_shade_map.html")
m
