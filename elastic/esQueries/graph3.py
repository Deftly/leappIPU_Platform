
import pandas as pd
import matplotlib.pyplot as plt

# Load the data from the new JSON file
file_path = 'upgradeResults4hr.json'
data = pd.read_json(file_path)

# Extract relevant data
buckets = data['aggregations']['failed_upgrade_jobs_by_4_hours']['buckets']

# Prepare the data for the bar graph
time_frames = [bucket['key'] for bucket in buckets]
total_upgrades = [bucket['total_upgrade_workflows']['doc_count'] for bucket in buckets]
failed_upgrades = [bucket['failed_upgrade_workflows']['doc_count'] for bucket in buckets]
failure_percentages = [bucket['failure_percentage']['value'] for bucket in buckets]

# Prompt for the graph title
graph_title = input("Please enter the title for the graph: ")

# Create the bar graph
fig, ax1 = plt.subplots(figsize=(16, 10))

# Plotting total upgrades and failed upgrades on the primary y-axis
ax1.set_xlabel('Time Frame')
ax1.set_ylabel('Number of Upgrades', color='tab:blue')
ax1.bar(time_frames, total_upgrades, label='Total Upgrades', alpha=0.7, color='tab:blue')
ax1.bar(time_frames, failed_upgrades, label='Failed Upgrades', alpha=0.7, color='tab:orange')
ax1.tick_params(axis='y', labelcolor='tab:blue')

# Creating a secondary y-axis for the failure percentage
ax2 = ax1.twinx()
ax2.set_ylabel('Failure Percentage', color='tab:red')
ax2.plot(time_frames, failure_percentages, label='Failure Percentage', color='tab:red', marker='o')
ax2.tick_params(axis='y', labelcolor='tab:red')

# Adding grid lines
ax1.grid(True, which='both', linestyle='--', linewidth=0.5)

# Adding dotted grid lines for the secondary y-axis
ax2.yaxis.grid(True, linestyle=':', linewidth=0.5, color='gray')

# Improving x-axis label readability by using a subset of labels
step = 1  # Show every label
ax1.set_xticks(range(len(time_frames))[::step])
ax1.set_xticklabels(time_frames[::step], rotation=-90, ha='center')

fig.tight_layout()
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

# Set the graph title from the user input
plt.title(graph_title)
plt.show()
