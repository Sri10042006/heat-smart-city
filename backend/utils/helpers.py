# utils/helpers.py

# -------------------------------
# CONSTANTS
# -------------------------------
BUILDING_FACTOR = 0.6
ROAD_FACTOR = 0.4
TREE_FACTOR = 0.5
WATER_FACTOR = 0.7

NORMAL_ROOF_HEAT = 10
COOL_ROOF_HEAT = 4

HEAT_THRESHOLD = 65


# -------------------------------
# HEAT CALCULATION
# -------------------------------
def calculate_heat(cell):
    """
    Calculates heat value for a city cell
    """

    # Roof heat based on roof type
    if cell["roof"] == "normal":
        roof_heat = NORMAL_ROOF_HEAT
    else:
        roof_heat = COOL_ROOF_HEAT

    heat = (
        cell["building"] * BUILDING_FACTOR +
        cell["road"] * ROAD_FACTOR +
        roof_heat -
        cell["tree"] * TREE_FACTOR -
        cell["water"] * WATER_FACTOR
    )

    return round(heat, 2)


# -------------------------------
# ZONE CLASSIFICATION
# -------------------------------
def classify_zone(heat):
    """
    Classifies zone based on heat value
    """
    if heat > 85:
        return "RED"
    elif heat >= 65:
        return "ORANGE"
    else:
        return "GREEN"


