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

        # region Normalize data
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USERNAME'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=os.getenv('MYSQL_PORT')
        )

        cursor = conn.cursor()
        normalize_data = []

        for index, data_row in enumerate(content_data):
            fk_customer_id = -1
            customer_name = f"{data_row[1]} {data_row[2]}"
            customer_name = customer_name.replace('"', "\\\"")

            if len(customer_name) == 0:
                continue

            print(f"customer_name {index+1}/{len(content_data)}: {customer_name}")

            select_query = f"SELECT pk_customer_id FROM Customers WHERE name = \"{customer_name}\" OR LOCATE(\"{customer_name}\", name) > 0"

            cursor.execute(select_query)
            results = cursor.fetchall()

            if len(results) > 0:
                fk_customer_id = results[0][0]

            if fk_customer_id != -1:
                normalize_data.append((
                    fk_customer_id,         # Foreign Key Customer ID
                    data_row[7],            # Billing Address
                    data_row[14],           # Shipping Address
                    data_row[10],           # City
                    data_row[11],           # State
                    data_row[19],           # Postal Code
                    data_row[20],           # Country
                    datetime.now(),         # Created At
                    datetime.now(),         # Updated At
                ))

        # endregion

        # region Initialize columns
        columns = ["fk_customer_id", "billing_address", "shipping_address", "city", "state", "postal_code",
                   "country", "created_at", "updated_at"]
        columns_str = ",".join(columns)

        columns_clause = ['%s' for _ in columns]
        columns_clause_str = ",".join(columns_clause)
        # endregion

        # region
        sql_query = f"INSERT INTO Addresses ({columns_str}) VALUES ({columns_clause_str})"

        cursor.executemany(sql_query, normalize_data)
        conn.commit()

        print(f"Contacts {cursor.rowcount} records inserted.")

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
