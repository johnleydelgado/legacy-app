import random
import traceback


def generate_numerics(length: int = 10):
    try:
        return random.randint(1, length)

    except Exception as err:
        print(f"generate_numerics error {err}: {traceback.print_exc()}")
        return None
