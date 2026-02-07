import requests
import uuid
from datetime import datetime

BASE_URL = "http://localhost:10000/api"

def test_shopping_list_logic():
    print("Testing Shopping List Logic...")
    
    # 1. Register/Login as test user
    email = f"test_{uuid.uuid4().hex[:6]}@test.com"
    password = "password123"
    
    print(f"Registering user: {email}")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email, 
        "password": password,
        "name": "Test User"
    })
    
    if reg_resp.status_code != 200:
        print(f"Registration failed: {reg_resp.text}")
        return
        
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get data
    products = requests.get(f"{BASE_URL}/public/products", headers=headers).json()
    supermarkets = requests.get(f"{BASE_URL}/public/supermarkets", headers=headers).json()
    units = requests.get(f"{BASE_URL}/admin/units", headers=headers).json()
    
    if not products or not supermarkets or not units:
        print("Required data not found")
        return

    product_id = products[0]['id']
    supermarket_id = supermarkets[0]['id']
    unit_id = units[0]['id']

    # 3. Create a price record (2 units for 4.00€ -> Unit Price = 2.00€)
    price_data = {
        "product_id": product_id,
        "supermarket_id": supermarket_id,
        "price": 4.00,
        "quantity": 2.0
    }
    requests.post(f"{BASE_URL}/prices", json=price_data, headers=headers)
    print("Created price record: 4.00€ for 2 units (Unit price = 2.00€)")

    # 4. Create a shopping list with 3 units
    list_data = {
        "name": "Test List",
        "supermarket_id": supermarket_id,
        "items": [
            {
                "product_id": product_id,
                "quantity": 3.0,
                "unit_id": unit_id,
                "price": 5.50, # Total price entered by user
                "purchased": True
            }
        ]
    }
    create_resp = requests.post(f"{BASE_URL}/shopping-lists", json=list_data, headers=headers)
    if create_resp.status_code != 200:
        print(f"Create list failed: {create_resp.text}")
        return
    
    lst = create_resp.json()
    item = lst['items'][0]
    
    print(f"Shopping List created with 3 units.")
    print(f"Entered Price (Total): {item['price']}€")
    print(f"Calculated Unit Price: {item['unit_price']}€")
    print(f"Calculated Estimated Price: {item['estimated_price']}€")
    print(f"Total Actual: {lst['total_actual']}€")
    print(f"Total Estimated: {lst['total_estimated']}€")

    # Expectations:
    # unit_price should be 5.50 / 3 = 1.833
    # estimated_price should be 2.00 (from previous record) * 3 (qty) = 6.00
    # total_actual should be 5.50 (NOT 5.50 * 3)
    # total_estimated should be 6.00

    errors = []
    if abs(item['unit_price'] - (5.50/3.0)) > 0.001:
        errors.append(f"Unit price wrong: expected {5.50/3.0}, got {item['unit_price']}")
    if abs(item['estimated_price'] - 6.00) > 0.001:
        errors.append(f"Estimated price wrong: expected 6.00, got {item['estimated_price']}")
    if abs(lst['total_actual'] - 5.50) > 0.001:
        errors.append(f"Total actual wrong: expected 5.50, got {lst['total_actual']}")
    if abs(lst['total_estimated'] - 6.00) > 0.001:
        errors.append(f"Total estimated wrong: expected 6.00, got {lst['total_estimated']}")

    if not errors:
        print("✅ All shopping list calculations are CORRECT!")
    else:
        print("❌ TEST FAILED:")
        for err in errors:
            print(f"  - {err}")

if __name__ == "__main__":
    test_shopping_list_logic()
