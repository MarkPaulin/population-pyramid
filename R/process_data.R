library(tidyverse)
library(readxl)
library(jsonlite)

mye_url <- "https://www.nisra.gov.uk/sites/nisra.gov.uk/files/publications/MYE19_SYA.xlsx"

download.file(mye_url, "data/raw/mye.xlsx", mode = "wb")

raw_data <- read_xlsx("data/raw/mye.xlsx", sheet = 2)

ni_data <- filter(raw_data, area == "1. Northern Ireland", gender != "All persons")
ni_data <- select(ni_data, year, gender, age, MYE)
ni_data <- mutate(ni_data, gender = str_sub(gender, 1, 1))

write_csv(ni_data, "data/population.csv")
