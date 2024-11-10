from datetime import datetime
from flask import Flask, request, jsonify

import main
import shade

app = Flask(__name__)


@app.route("/", methods=["GET"])
def root_path():
    return


@app.route("/api/shadiest_route", methods=["GET"])
def shadiest_route():
    start_lat = request.args.get("start_lat", type=float)
    start_lon = request.args.get("start_lon", type=float)
    end_lat = request.args.get("end_lat", type=float)
    end_lon = request.args.get("end_lon", type=float)

    if None in [start_lat, start_lon, end_lat, end_lon]:
        return (
            jsonify(
                {
                    "error": "Missing parameters. Please provide start_lat, start_lon, end_lat, and end_lon."
                }
            ),
            400,
        )

    route = main.shadiest_path(start_lat, start_lon, end_lat, end_lon)
    # not functional yet
    # shade_percent = shade.calculate_shade(
    #     route, shade.get_nearby_obstructions(route), datetime.now()
    # )
    shade_percent = 76  # just a random number

    return jsonify({"route": route, "shade_percent": shade_percent})


if __name__ == "__main__":
    app.run(debug=True)
