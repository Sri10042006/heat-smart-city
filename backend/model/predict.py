from utils.helpers import calculate_heat, classify_zone, HEAT_THRESHOLD

def mitigate(cell):
    suggestions = []

    if cell["heat"] > HEAT_THRESHOLD:

        if cell["tree"] < 20:
            cell["tree"] += 15
            cell["building"] -= 10
            suggestions.append("Increase Trees")

        if cell["roof"] == "normal":
            cell["roof"] = "cool"
            suggestions.append("Apply Cool Roof")

        if cell["road"] > 30:
            cell["road"] -= 10
            cell["tree"] += 10
            suggestions.append("Reflective Pavement")

    return suggestions


# ---------------- TESTING BLOCK ----------------
if __name__ == "__main__":
    test_cell = {
        "heat": 42,
        "tree": 10,
        "building": 60,
        "roof": "normal",
        "road": 40
    }

    result = mitigate(test_cell)
    print("Mitigation Suggestions:")
    print(result)
