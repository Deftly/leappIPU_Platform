import time
from rhel_upgrade_ingestion import gather_region_data

def get_region_cookies():
  region_cookies = {}
  regions = ["amrs", "apac", "emea", "dmz"]

  for region in regions:
    cookie = input(f"Enter the authentication cookie for {region}: ")
    region_cookies[region] = cookie

  return region_cookies

def main():
  region_cookies = get_region_cookies()

  while True:
    for region, cookie in region_cookies.items():
      print(f"Gathering data for {region}")
      result = gather_region_data(region, cookie)
      uploaded_workflows = result["uploaded_workflows"]
      non_uploaded_workflows = result["non_uploaded_workflows"]
      print(f"Uploaded workflows for {region}: {len(uploaded_workflows)}")
      print(f"Non-uploaded workflows for {region}: {len(non_uploaded_workflows)}")
      print("------------------------")
    
    print("Waiting for 20 minutes before next iteration...")
    time.sleep(20 * 60)

if __name__ == "__main__":
  main()