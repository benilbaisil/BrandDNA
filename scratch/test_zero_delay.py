import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def run():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1440,900')

    driver = webdriver.Chrome(options=chrome_options)
    try:
        # 1. Test Inventory Staff Products Tab
        print("Checking /inventory?tab=products...")
        driver.get("http://localhost:5173/inventory?tab=products")
        time.sleep(1.5)
        driver.save_screenshot("scratch/test_inventory_products.png")
        page_src = driver.page_source
        has_table = "Products & Stock Inventory" in page_src or "SKU-" in page_src or "Leather Bag" in page_src
        print("Inventory products displayed:", has_table)

        # 2. Test Inventory Staff Delivery Tab
        print("Checking /inventory?tab=delivery...")
        driver.get("http://localhost:5173/inventory?tab=delivery")
        time.sleep(1.5)
        driver.save_screenshot("scratch/test_inventory_delivery.png")
        delivery_src = driver.page_source
        has_tom = "tom" in delivery_src
        has_rahul = "Rahul" in delivery_src
        has_extra = "Test Delivery Agent" in delivery_src or "agent_1" in delivery_src
        print(f"Delivery tab: Tom found: {has_tom}, Rahul found: {has_rahul}, Extra agents found: {has_extra}")

        # 3. Test Storefront / Customer Dashboard
        print("Checking Homepage & Customer View...")
        driver.get("http://localhost:5173/")
        time.sleep(1.0)
        driver.save_screenshot("scratch/test_homepage_instant.png")
        home_src = driver.page_source
        has_slider = "FEATURED PERFORMANCE GEAR" in home_src or "Summit Pro" in home_src or "Explore Gear" in home_src
        print("Homepage instant slider ready:", has_slider)

    finally:
        driver.quit()

if __name__ == '__main__':
    run()
