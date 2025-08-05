import argparse
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
        json_fn = param_data_fn.strip()
        data_source_fp = os.path.join(current_dir, 'data_source', json_fn)
        file_ext = json_fn.split('.')[-1]

        data_source_exists = os.path.exists(data_source_fp)
        is_csv = file_ext == 'csv'
        is_json = file_ext == 'json'
        content_data = None
        # endregion

        # region Parse csv file
        if is_csv and data_source_exists:
            pass
        # endregion

        # region Parse json file
        if is_json and data_source_exists:
            with open(data_source_fp, "r") as file:
                content_data = json.load(file)
        # endregion

        # region Normalize data
        columns = ["name", "industry", "website_url", "email", "phone_number",
                   "billing_address", "shipping_address", "city", "state", "postal_code", "country",
                   "notes", "tags", "created_at", "updated_at"]
        columns_str = ",".join(columns)

        columns_clause = ['%s' for _ in columns]
        columns_clause_str = ",".join(columns_clause)

        normalize_data = [(
            data.get('name'),
            data.get('industry'),
            data.get('website_url'),
            data.get('email'),
            data.get('phone_number'),
            data.get('billing_address'),
            data.get('shipping_address'),
            data.get('city'),
            data.get('state'),
            data.get('postal_code'),
            data.get('country'),
            data.get('notes'),
            data.get('tags'),
            datetime.now(),
            datetime.now()
        ) for data in content_data]
        # endregion

        # region
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USERNAME'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=os.getenv('MYSQL_PORT')
        )

        cursor = conn.cursor()

        sql_query = f"INSERT INTO Organizations ({columns_str}) VALUES ({columns_clause_str})"

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
