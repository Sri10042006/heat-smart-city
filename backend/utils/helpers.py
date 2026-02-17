HEAT_THRESHOLD = 35

def calculate_heat(cell):
    return cell["heat"]

def classify_zone(heat):
    if heat > 40:
        return "High Risk"
    elif heat > 30:
        return "Medium Risk"
    else:
        return "Low Risk"

