import argparse
import csv
import json
import os
import traceback

import mysql.connector

from datetime import datetime
from dotenv import load_dotenv

from utils.characters_generation import generate_numerics


load_dotenv()

def import_data_file(param_data_fn: str):
    try:
        # region Get data source filepath
        current_dir = os.getcwd()
        param_data_fn = param_data_fn.strip()
        data_source_fp = os.path.join(current_dir, 'data_source', param_data_fn)
        file_ext = param_data_fn.split('.')[-1]

        data_source_exists = os.path.exists(data_source_fp)
        is_csv = file_ext == 'csv'
        is_json = file_ext == 'json'
        content_data = []
        # endregion

        # region Parse csv file
        if is_csv and data_source_exists:
            with open(data_source_fp, mode="r") as file:
                reader = csv.reader(file)

                index = 0
                for row in reader:
                    if index > 0:
                        content_data.append(row)

                    index += 1
        # endregion

        # region Parse json file
        if is_json and data_source_exists:
            with open(data_source_fp, "r") as file:
                content_data = json.load(file)
        # endregion

        # region Initialize SQL connection
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USERNAME'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=os.getenv('MYSQL_PORT')
        )

        cursor = conn.cursor()
        # endregion

        # region Normalize data
        customers_columns = ["fk_organization_id", "name", "email", "phone_number", "mobile_number", "website_url",
                             "industry", "customer_type", "status", "source", "converted_at", "notes", "vat_number",
                             "tax_id", "tags", "created_at", "updated_at"]
        columns_str = ",".join(customers_columns)

        columns_clause = ['%s' for _ in customers_columns]
        columns_clause_str = ",".join(columns_clause)

        normalize_data = [(
            1,                                              # Foreign Key Organization ID
            f"{data[1].strip()} {data[2].strip()}",         # Name
            data[4],                                        # Email
            data[5],                                        # Phone Number
            -1,                                             # Mobile Number
            "None",                                         # Website URL
            # data[7],                                        # Billing Address
            # data[14],                                       # Shipping Address
            # data[10],                                       # City
            # data[11],                                       # State
            # data[19],                                       # Postal Code
            # data[20],                                       # Country
            "None",                                         # Industry
            "LEAD",                                         # Customer Type
            "ACTIVE",                                       # Status
            data[24],                                       # Source
            data[23],                                       # Converted At
            f"{data[25]}\n{data[26]}",                      # Notes
            data[22],                                       # VAT Number
            "",                                             # Tax ID
            "[]",                                           # Tags
            datetime.now(),                                 # created_at
            datetime.now()                                  # updated_at
        ) for data in content_data]
        # endregion

        # region
        sql_query = f"INSERT INTO Customers ({columns_str}) VALUES ({columns_clause_str})"

        cursor.executemany(sql_query, normalize_data)  # Efficient bulk insert
        conn.commit()  # Commit changes

        print(f"{cursor.rowcount} records inserted.")



        cursor.close()
        conn.close()
        # endregion

    except Exception as err:
        print(f"err: {err} : {traceback.print_exc()}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="A script that import data to DB")
    parser.add_argument("--data-file", help="JSON or CSV file data")

    args = parser.parse_args()
    data_fn = args.data_file

    import_data_file(data_fn)
