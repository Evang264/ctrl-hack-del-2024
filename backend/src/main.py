import osmnx as ox
import networkx as nx
import folium
from shapely.geometry import LineString
from geopandas.tools import sjoin
import geopandas as gpd
from pyproj import Transformer
import pandas as pd


def shadiest_path(lat1, lon1, lat2, lon2) -> "list[tuple[float, float]]":
    # Compute the bounding box with buffer
    buffer = 0.01  # degrees
    north = max(lat1, lat2) + buffer
    south = min(lat1, lat2) - buffer
    east = max(lon1, lon2) + buffer
    west = min(lon1, lon2) - buffer

    # Download the street network
    G = ox.graph_from_bbox(north, south, east, west, network_type="walk")

    nodes, edges = ox.graph_to_gdfs(G, fill_edge_geometry=True)
    G = ox.graph_from_gdfs(nodes, edges, graph_attrs=G.graph)

    # Get the nearest nodes to the points
    orig_node = ox.nearest_nodes(G, lon1, lat1)
    dest_node = ox.nearest_nodes(G, lon2, lat2)

    # Project the graph to UTM
    G_proj = ox.project_graph(G)

    # Get the edges GeoDataFrame
    edges_proj = ox.graph_to_gdfs(G_proj, nodes=False, edges=True)
    edges_proj = edges_proj.reset_index()

    # Download the trees and buildings in the area
    tags_trees = {"natural": "tree"}
    trees = ox.geometries_from_bbox(north, south, east, west, tags_trees)

    tags_buildings = {"building": True}
    buildings = ox.geometries_from_bbox(north, south, east, west, tags_buildings)

    # Combine trees and buildings into one GeoDataFrame
    shading_elements = gpd.GeoDataFrame(
        pd.concat([trees, buildings], ignore_index=True)
    )
    shading_elements = shading_elements.set_geometry("geometry")
    shading_elements.crs = trees.crs  # Ensure CRS is set

    # Project the shading elements to the same CRS as edges_proj
    shading_elements_proj = shading_elements.to_crs(edges_proj.crs)

    # Buffer the edges
    buffer_dist = 20  # meters
    edges_proj["buffer"] = edges_proj.geometry.buffer(buffer_dist)

    # Create a GeoDataFrame of edge buffers
    edges_buffers = edges_proj[["u", "v", "key", "buffer"]].copy()
    edges_buffers = edges_buffers.set_geometry("buffer")
    edges_buffers.crs = edges_proj.crs
    edges_buffers["edge_id"] = edges_buffers.index

    # Perform spatial join
    edges_trees = sjoin(
        edges_buffers, shading_elements_proj, how="left", predicate="contains"
    )

    # Count the number of trees per edge
    tree_counts = edges_trees.groupby("edge_id").size().reset_index(name="tree_count")

    # Merge tree_counts with edges_proj
    edges_proj["edge_id"] = edges_proj.index
    edges_proj = edges_proj.merge(tree_counts, on="edge_id", how="left")
    edges_proj["tree_count"] = edges_proj["tree_count"].fillna(0)

    # Compute the weight for each edge
    k = 10  # importance factor
    edges_proj["weight"] = edges_proj["length"] / (1 + k * edges_proj["tree_count"])

    # Create a dictionary of edge weights
    edge_weights = edges_proj.set_index(["u", "v", "key"])["weight"].to_dict()

    # Update the weights in the graph
    for u, v, key, data in G_proj.edges(keys=True, data=True):
        data["weight"] = edge_weights.get((u, v, key), data["length"])

    # Compute the shortest path
    try:
        route = nx.shortest_path(G_proj, orig_node, dest_node, weight="weight")
    except nx.NetworkXNoPath:
        print("No path found between the two points.")
        exit()

    # Get the route geometry
    route_edges = ox.utils_graph.get_route_edge_attributes(G_proj, route, "geometry")

    # Create the map
    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2
    m = folium.Map(location=[mid_lat, mid_lon], zoom_start=14)

    # Create the route coordinates
    route_coords = []
    for geom in route_edges:
        if isinstance(geom, LineString):
            coords = list(geom.coords)
        else:
            # If geom is MultiLineString, extract the LineStrings
            coords = []
            for part in geom:
                coords.extend(list(part.coords))
        route_coords.extend(coords)

    # Remove duplicates
    route_coords = [
        route_coords[i]
        for i in range(len(route_coords))
        if i == 0 or route_coords[i] != route_coords[i - 1]
    ]

    # Define the UTM zone and whether it's in the northern hemisphere
    utm_zone = 17  # Replace with your UTM zone
    is_northern = True  # True if in the northern hemisphere, False if in the southern

    # Create a transformer object
    proj_utm = f"+proj=utm +zone={utm_zone} +{'north' if is_northern else 'south'} +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
    proj_wgs84 = "EPSG:4326"
    transformer = Transformer.from_crs(proj_utm, proj_wgs84, always_xy=True)

    coords = []
    for coord in route_coords:
        lon, lat = transformer.transform(coord[0], coord[1])
        coords.append((lat, lon))

    return coords

    # # Add the route to the map
    # folium.PolyLine(route_coords, color="blue", weight=5, opacity=0.8).add_to(m)

    # # Add markers
    # folium.Marker(
    #     location=[lat1, lon1], popup="Origin", icon=folium.Icon(color="green")
    # ).add_to(m)
    # folium.Marker(
    #     location=[lat2, lon2], popup="Destination", icon=folium.Icon(color="red")
    # ).add_to(m)

    # for coord in coords:
    #     folium.Marker(
    #         location=coord, popup="Destination", icon=folium.Icon(color="blue")
    #     ).add_to(m)

    # with open("../frontend/public/trees.csv", "r") as csvfile:
    #     coord_reader = csv.reader(csvfile)
    #     for row in coord_reader:
    #         try:
    #             lat, lon = float(row[0]), float(row[1])
    #             folium.CircleMarker(
    #                 location=[lat, lon],
    #                 radius=8,
    #                 color="green",
    #                 fill=True,
    #                 fill_opacity=0.6,
    #             ).add_to(m)
    #         except ValueError:
    #             pass

    # # Save the map to an HTML file
    # m.save("shadiest_route.html")

    # print("Map saved to shadiest_route.html")

    # # Save the route coordinates to a CSV file
    # with open("route_coordinates.csv", "w", newline="") as csvfile:
    #     coord_writer = csv.writer(csvfile)
    #     coord_writer.writerow(["latitude", "longitude"])
    #     for coord in coords:
    #         coord_writer.writerow(coord)

    # print("Route coordinates saved to route_coordinates.csv")
