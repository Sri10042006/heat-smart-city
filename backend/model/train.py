import numpy as np
from utils.helpers import calculate_heat, classify_zone

# Grid size
GRID_SIZE = 10

# Create empty city grid (10x10)
city_grid = np.empty((GRID_SIZE, GRID_SIZE), dtype=object)

# Initialize city grid cells
for i in range(GRID_SIZE):
    for j in range(GRID_SIZE):
        city_grid[i][j] = {
            "building": np.random.randint(40, 80),
            "road": np.random.randint(10, 30),
            "tree": np.random.randint(5, 25),
            "water": np.random.randint(0, 10),
            "roof": "normal",
            "heat": 0,
            "zone": ""
        }

# Calculate initial heat and zone
for i in range(GRID_SIZE):
    for j in range(GRID_SIZE):
        cell = city_grid[i][j]
        cell["heat"] = calculate_heat(cell)
        cell["zone"] = classify_zone(cell["heat"])

print("Initial heat calculation completed.")

