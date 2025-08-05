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

        # region
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USERNAME'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=os.getenv('MYSQL_PORT')
        )

        cursor = conn.cursor()
        orders_normalize_data = []
        invoice_normalize_data = []

        for index, data_row in enumerate(content_data):
            fk_customer_id = -1
            order_number = data_row[0]
            order_date = data_row[1]
            customer_due_date = data_row[5]
            invoice_date = data_row[6]
            customer_name = data_row[10]
            customer_notes = data_row[14]
            production_notes = data_row[15]
            total_quantity = data_row[16] if type(data_row[16]) == int else 0
            sales_tax = data_row[17] if type(data_row[17]) == int else 0
            total_untaxed = data_row[18] if type(data_row[18]) == int else 0
            amount_paid = data_row[19] if type(data_row[19]) == int else 0
            amount_outstanding = data_row[20] if type(data_row[20]) == int else 0
            item_total = data_row[21] if type(data_row[21]) == int else 0
            add_emb_loc = data_row[23] if type(data_row[23]) == int else 0
            total = data_row[25] if type(data_row[25]) == int else 0
            tags = data_row[31]

            if len(customer_name) > 0:
                # escape_customer_name = customer_name

                print(f"customer_name {index + 1}/{len(content_data)}: {customer_name}")

                select_query = f"SELECT pk_customer_id FROM Customers WHERE name = \"{customer_name}\" OR LOCATE(\"{customer_name}\", name) > 0"

                cursor.execute(select_query)
                results = cursor.fetchall()

                if len(results) > 0:
                    fk_customer_id = results[0][0]

            if fk_customer_id != -1:
                orders_normalize_data.append((
                    fk_customer_id,                     # Foreign Key Customer ID
                    order_number,                       # Order Number
                    order_date,                         # Order Date
                    "DRAFT",                            # Status
                    amount_paid,                        # Subtotal
                    sales_tax,                          # Tax Total
                    total,                              # Total Amount
                    "USD",                              # Currency
                    customer_notes,                     # Notes
                    json.dumps({"tag1": tags}),         # Tags
                    datetime.now(),                     # Created At
                    datetime.now(),                     # Updated At
                ))

                invoice_normalize_data.append((
                    fk_customer_id,                     # Foreign Key Customer ID
                    order_number,                       # Invoice Number
                    invoice_date,                       # Invoice Date
                    customer_due_date,                  # Due Date
                    "DRAFT",                            # Status
                    amount_paid,                        # Subtotal
                    sales_tax,                          # Tax total
                    total,                              # Total amount
                    "USD",                              # Currency
                    production_notes,                   # Notes
                    "",                                 # terms
                    json.dumps({"tag1": tags}),         # Tags
                    datetime.now(),                     # Created At
                    datetime.now(),                     # Updated At
                ))

        # endregion

        # region Initializing columns and columns clause
        orders_columns = ["fk_customer_id", "order_number", "order_date", "status", "subtotal", "tax_total",
                          "total_amount", "currency", "notes", "tags", "created_at", "updated_at"]
        orders_columns_str = ",".join(orders_columns)

        orders_columns_clause = ['%s' for _ in orders_columns]
        orders_columns_clause_str = ",".join(orders_columns_clause)

        invoice_columns = ["fk_customer_id", "invoice_number", "invoice_date", "due_date", "status", "subtotal",
                           "taxtotal", "total_amount", "currency", "notes", "terms", "tags", "created_at",
                           "updated_at"]
        invoice_columns_str = ",".join(invoice_columns)

        invoice_columns_clause = ['%s' for _ in invoice_columns]
        invoice_columns_clause_str = ",".join(invoice_columns_clause)
        # endregion

        # region Bulk insert Orders table
        orders_sql_query = f"INSERT INTO Orders ({orders_columns_str}) VALUES ({orders_columns_clause_str})"

        cursor.executemany(orders_sql_query, orders_normalize_data)
        conn.commit()

        print(f"Orders {cursor.rowcount} records inserted.")
        # endregion

        # region Bulk insert Invoice table
        invoice_sql_query = f"INSERT INTO Invoices ({invoice_columns_str}) VALUES ({invoice_columns_clause_str})"

        cursor.executemany(invoice_sql_query, invoice_normalize_data)
        conn.commit()

        print(f"Invoice {cursor.rowcount} records inserted.")
        # endregion

        # region Close cursor and connections
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
