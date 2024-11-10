from datetime import datetime
from flask import Flask, request, jsonify, make_response
import math

import main

app = Flask(__name__)


def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response


def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/", methods=["GET"])
def root_path():
    return


@app.route("/api/shadiest_route", methods=["GET", "OPTIONS"])
def shadiest_route():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()

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
    shade_percent = min(89, math.sqrt(len(route)) * 10)

    return _corsify_actual_response(
        jsonify({"route": route, "shade_percent": shade_percent})
    )


if __name__ == "__main__":
    app.run(debug=True)
