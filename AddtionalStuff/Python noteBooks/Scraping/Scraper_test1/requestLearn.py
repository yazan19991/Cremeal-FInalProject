from selenium import webdriver
from selenium.webdriver.common.by import By
import pandas as pd

options = webdriver.ChromeOptions()
options.add_experimental_option("detach", True)

website = 'https://www.allrecipes.com/recipes/17056/everyday-cooking/more-meal-ideas/5-ingredients/appetizers/'
chromedriver_path = './chromedriver'

driver = webdriver.Chrome(options=options, executable_path=chromedriver_path)
driver.get(website)
my_element = driver.find_elements(By.XPATH,'//a[contains(@id,"mntl-card-list-items_2-0")]')
for elm in my_element:
    elm.click()
# driver.quit()
