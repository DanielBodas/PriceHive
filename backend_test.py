import requests
import sys
import json
from datetime import datetime

class PriceHiveAPITester:
    def __init__(self, base_url="https://pricehive.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Store created IDs for cleanup and further testing
        self.created_ids = {
            'categories': [],
            'brands': [],
            'supermarkets': [],
            'units': [],
            'products': [],
            'posts': [],
            'shopping_lists': []
        }

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            return success, response.json() if success else response.text, response.status_code

        except Exception as e:
            return False, str(e), 0

    def test_admin_login(self):
        """Test admin login"""
        success, response, status = self.make_request(
            'POST', 'auth/login',
            data={"email": "admin@pricehive.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_result("Admin Login", True)
            return True
        else:
            self.log_result("Admin Login", False, f"Status: {status}, Response: {response}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response, status = self.make_request(
            'POST', 'auth/register',
            data={"email": test_email, "password": "test123", "name": "Test User"}
        )
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.log_result("User Registration", True)
            return True
        else:
            self.log_result("User Registration", False, f"Status: {status}, Response: {response}")
            return False

    def test_user_login(self):
        """Test existing user login"""
        success, response, status = self.make_request(
            'POST', 'auth/login',
            data={"email": "test@test.com", "password": "test123"}
        )
        if success and 'access_token' in response:
            if not self.user_token:  # Use existing user if registration failed
                self.user_token = response['access_token']
            self.log_result("User Login", True)
            return True
        else:
            self.log_result("User Login", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_me(self):
        """Test get current user info"""
        success, response, status = self.make_request(
            'GET', 'auth/me', token=self.admin_token
        )
        if success and 'email' in response:
            self.log_result("Get Current User", True)
            return True
        else:
            self.log_result("Get Current User", False, f"Status: {status}")
            return False

    def test_admin_categories(self):
        """Test category CRUD operations"""
        # Create category
        success, response, status = self.make_request(
            'POST', 'admin/categories',
            data={"name": "Test Category", "description": "Test description"},
            token=self.admin_token,
            expected_status=200
        )
        if success and 'id' in response:
            cat_id = response['id']
            self.created_ids['categories'].append(cat_id)
            self.log_result("Create Category", True)
            
            # Get categories
            success, response, status = self.make_request(
                'GET', 'admin/categories', token=self.admin_token
            )
            if success and isinstance(response, list):
                self.log_result("Get Categories", True)
                
                # Update category
                success, response, status = self.make_request(
                    'PUT', f'admin/categories/{cat_id}',
                    data={"name": "Updated Category", "description": "Updated description"},
                    token=self.admin_token
                )
                if success:
                    self.log_result("Update Category", True)
                else:
                    self.log_result("Update Category", False, f"Status: {status}")
            else:
                self.log_result("Get Categories", False, f"Status: {status}")
        else:
            self.log_result("Create Category", False, f"Status: {status}, Response: {response}")

    def test_admin_brands(self):
        """Test brand CRUD operations"""
        success, response, status = self.make_request(
            'POST', 'admin/brands',
            data={"name": "Test Brand"},
            token=self.admin_token
        )
        if success and 'id' in response:
            brand_id = response['id']
            self.created_ids['brands'].append(brand_id)
            self.log_result("Create Brand", True)
            
            # Get brands
            success, response, status = self.make_request(
                'GET', 'admin/brands', token=self.admin_token
            )
            if success:
                self.log_result("Get Brands", True)
            else:
                self.log_result("Get Brands", False, f"Status: {status}")
        else:
            self.log_result("Create Brand", False, f"Status: {status}")

    def test_admin_supermarkets(self):
        """Test supermarket CRUD operations"""
        success, response, status = self.make_request(
            'POST', 'admin/supermarkets',
            data={"name": "Test Supermarket"},
            token=self.admin_token
        )
        if success and 'id' in response:
            sm_id = response['id']
            self.created_ids['supermarkets'].append(sm_id)
            self.log_result("Create Supermarket", True)
            
            # Get supermarkets
            success, response, status = self.make_request(
                'GET', 'admin/supermarkets', token=self.admin_token
            )
            if success:
                self.log_result("Get Supermarkets", True)
            else:
                self.log_result("Get Supermarkets", False, f"Status: {status}")
        else:
            self.log_result("Create Supermarket", False, f"Status: {status}")

    def test_admin_units(self):
        """Test unit CRUD operations"""
        success, response, status = self.make_request(
            'POST', 'admin/units',
            data={"name": "Test Unit", "abbreviation": "tu"},
            token=self.admin_token
        )
        if success and 'id' in response:
            unit_id = response['id']
            self.created_ids['units'].append(unit_id)
            self.log_result("Create Unit", True)
            
            # Get units
            success, response, status = self.make_request(
                'GET', 'admin/units', token=self.admin_token
            )
            if success:
                self.log_result("Get Units", True)
            else:
                self.log_result("Get Units", False, f"Status: {status}")
        else:
            self.log_result("Create Unit", False, f"Status: {status}")

    def test_admin_products(self):
        """Test product CRUD operations"""
        # Need existing category, brand, and unit
        if not (self.created_ids['categories'] and self.created_ids['brands'] and self.created_ids['units']):
            self.log_result("Create Product", False, "Missing dependencies (category, brand, unit)")
            return

        success, response, status = self.make_request(
            'POST', 'admin/products',
            data={
                "name": "Test Product",
                "brand_id": self.created_ids['brands'][0],
                "category_id": self.created_ids['categories'][0],
                "unit_id": self.created_ids['units'][0],
                "barcode": "1234567890"
            },
            token=self.admin_token
        )
        if success and 'id' in response:
            prod_id = response['id']
            self.created_ids['products'].append(prod_id)
            self.log_result("Create Product", True)
            
            # Get products
            success, response, status = self.make_request(
                'GET', 'admin/products', token=self.admin_token
            )
            if success:
                self.log_result("Get Products", True)
            else:
                self.log_result("Get Products", False, f"Status: {status}")
        else:
            self.log_result("Create Product", False, f"Status: {status}, Response: {response}")

    def test_prices(self):
        """Test price operations"""
        if not (self.created_ids['products'] and self.created_ids['supermarkets']):
            self.log_result("Create Price", False, "Missing dependencies (product, supermarket)")
            return

        success, response, status = self.make_request(
            'POST', 'prices',
            data={
                "product_id": self.created_ids['products'][0],
                "supermarket_id": self.created_ids['supermarkets'][0],
                "price": 2.50,
                "quantity": 1
            },
            token=self.user_token
        )
        if success:
            self.log_result("Create Price", True)
            
            # Get prices
            success, response, status = self.make_request(
                'GET', 'prices', token=self.user_token
            )
            if success:
                self.log_result("Get Prices", True)
            else:
                self.log_result("Get Prices", False, f"Status: {status}")
        else:
            self.log_result("Create Price", False, f"Status: {status}")

    def test_social_features(self):
        """Test social features (posts, comments, reactions)"""
        # Create post
        success, response, status = self.make_request(
            'POST', 'posts',
            data={"content": "Test post content", "post_type": "update"},
            token=self.user_token
        )
        if success and 'id' in response:
            post_id = response['id']
            self.created_ids['posts'].append(post_id)
            self.log_result("Create Post", True)
            
            # Get posts
            success, response, status = self.make_request(
                'GET', 'posts', token=self.user_token
            )
            if success:
                self.log_result("Get Posts", True)
                
                # React to post
                success, response, status = self.make_request(
                    'POST', f'posts/{post_id}/react',
                    data={"reaction_type": "like"},
                    token=self.user_token
                )
                if success:
                    self.log_result("React to Post", True)
                    
                    # Add comment
                    success, response, status = self.make_request(
                        'POST', f'posts/{post_id}/comments',
                        data={"content": "Test comment"},
                        token=self.user_token
                    )
                    if success:
                        self.log_result("Add Comment", True)
                        
                        # Get comments
                        success, response, status = self.make_request(
                            'GET', f'posts/{post_id}/comments', token=self.user_token
                        )
                        if success:
                            self.log_result("Get Comments", True)
                        else:
                            self.log_result("Get Comments", False, f"Status: {status}")
                    else:
                        self.log_result("Add Comment", False, f"Status: {status}")
                else:
                    self.log_result("React to Post", False, f"Status: {status}")
            else:
                self.log_result("Get Posts", False, f"Status: {status}")
        else:
            self.log_result("Create Post", False, f"Status: {status}")

    def test_shopping_lists(self):
        """Test shopping list operations"""
        if not (self.created_ids['products'] and self.created_ids['supermarkets'] and self.created_ids['units']):
            self.log_result("Create Shopping List", False, "Missing dependencies")
            return

        success, response, status = self.make_request(
            'POST', 'shopping-lists',
            data={
                "name": "Test Shopping List",
                "supermarket_id": self.created_ids['supermarkets'][0],
                "items": [{
                    "product_id": self.created_ids['products'][0],
                    "quantity": 2,
                    "unit_id": self.created_ids['units'][0],
                    "purchased": False
                }]
            },
            token=self.user_token
        )
        if success and 'id' in response:
            list_id = response['id']
            self.created_ids['shopping_lists'].append(list_id)
            self.log_result("Create Shopping List", True)
            
            # Get shopping lists
            success, response, status = self.make_request(
                'GET', 'shopping-lists', token=self.user_token
            )
            if success:
                self.log_result("Get Shopping Lists", True)
                
                # Get specific shopping list
                success, response, status = self.make_request(
                    'GET', f'shopping-lists/{list_id}', token=self.user_token
                )
                if success:
                    self.log_result("Get Shopping List Detail", True)
                else:
                    self.log_result("Get Shopping List Detail", False, f"Status: {status}")
            else:
                self.log_result("Get Shopping Lists", False, f"Status: {status}")
        else:
            self.log_result("Create Shopping List", False, f"Status: {status}")

    def test_shopping_list_dynamic_editing(self):
        """Test shopping list dynamic editing functionality"""
        if not (self.created_ids['products'] and self.created_ids['supermarkets'] and 
                self.created_ids['units'] and self.created_ids['brands']):
            self.log_result("Shopping List Dynamic Editing", False, "Missing dependencies")
            return

        # Create a shopping list named "Test List"
        success, response, status = self.make_request(
            'POST', 'shopping-lists',
            data={
                "name": "Test List",
                "supermarket_id": self.created_ids['supermarkets'][0],
                "items": [{
                    "product_id": self.created_ids['products'][0],
                    "quantity": 1,
                    "unit_id": self.created_ids['units'][0],
                    "purchased": False,
                    "brand_id": None,
                    "price": None
                }]
            },
            token=self.user_token
        )
        
        if not success or 'id' not in response:
            self.log_result("Create Test List for Dynamic Editing", False, f"Status: {status}")
            return
            
        list_id = response['id']
        self.created_ids['shopping_lists'].append(list_id)
        self.log_result("Create Test List for Dynamic Editing", True)
        
        # Test dynamic editing: Update brand, quantity, and price
        updated_items = [{
            "product_id": self.created_ids['products'][0],
            "quantity": 5,  # Changed quantity to 5
            "unit_id": self.created_ids['units'][0],
            "purchased": False,
            "brand_id": self.created_ids['brands'][0],  # Changed brand
            "price": 10.50  # Added price with € symbol test
        }]
        
        success, response, status = self.make_request(
            'PUT', f'shopping-lists/{list_id}',
            data={
                "name": "Test List",
                "supermarket_id": self.created_ids['supermarkets'][0],
                "items": updated_items
            },
            token=self.user_token
        )
        
        if success:
            self.log_result("Update Shopping List - Dynamic Editing", True)
            
            # Verify the changes were saved by getting the list again
            success, response, status = self.make_request(
                'GET', f'shopping-lists/{list_id}', token=self.user_token
            )
            
            if success and 'items' in response and len(response['items']) > 0:
                item = response['items'][0]
                
                # Check if quantity was updated to 5
                if item.get('quantity') == 5:
                    self.log_result("Verify Quantity Update (5)", True)
                else:
                    self.log_result("Verify Quantity Update (5)", False, f"Expected 5, got {item.get('quantity')}")
                
                # Check if brand was updated
                if item.get('brand_id') == self.created_ids['brands'][0]:
                    self.log_result("Verify Brand Update", True)
                else:
                    self.log_result("Verify Brand Update", False, f"Brand not updated correctly")
                
                # Check if price was updated to 10.50
                if item.get('price') == 10.50:
                    self.log_result("Verify Price Update (10.50€)", True)
                else:
                    self.log_result("Verify Price Update (10.50€)", False, f"Expected 10.50, got {item.get('price')}")
                    
                # Test data persistence after "refresh" (another GET request)
                success2, response2, status2 = self.make_request(
                    'GET', f'shopping-lists/{list_id}', token=self.user_token
                )
                
                if success2 and 'items' in response2 and len(response2['items']) > 0:
                    item2 = response2['items'][0]
                    if (item2.get('quantity') == 5 and 
                        item2.get('brand_id') == self.created_ids['brands'][0] and 
                        item2.get('price') == 10.50):
                        self.log_result("Verify Data Persistence After Refresh", True)
                    else:
                        self.log_result("Verify Data Persistence After Refresh", False, "Data not persisted")
                else:
                    self.log_result("Verify Data Persistence After Refresh", False, f"Status: {status2}")
                    
            else:
                self.log_result("Verify Shopping List Updates", False, f"Status: {status}")
        else:
            self.log_result("Update Shopping List - Dynamic Editing", False, f"Status: {status}")

    def test_session_persistence(self):
        """Test session persistence using cookies"""
        # This test simulates session persistence by checking if the session token works
        # across multiple requests without re-authentication
        
        # First, login and get session info
        success, response, status = self.make_request(
            'POST', 'auth/login',
            data={"email": "admin@pricehive.com", "password": "admin123"}
        )
        
        if not success or 'access_token' not in response:
            self.log_result("Session Persistence - Initial Login", False, f"Status: {status}")
            return
            
        session_token = response['access_token']
        self.log_result("Session Persistence - Initial Login", True)
        
        # Test that the token works for accessing protected endpoints
        success, response, status = self.make_request(
            'GET', 'auth/me', token=session_token
        )
        
        if success and 'email' in response:
            self.log_result("Session Persistence - Access Protected Endpoint", True)
            
            # Simulate "navigation" to alerts endpoint (another protected endpoint)
            success, response, status = self.make_request(
                'GET', 'alerts', token=session_token
            )
            
            if success:
                self.log_result("Session Persistence - Navigate to Alerts", True)
            else:
                self.log_result("Session Persistence - Navigate to Alerts", False, f"Status: {status}")
                
        else:
            self.log_result("Session Persistence - Access Protected Endpoint", False, f"Status: {status}")

    def test_analytics(self):
        """Test analytics endpoints"""
        # Get general stats
        success, response, status = self.make_request(
            'GET', 'analytics/stats', token=self.user_token
        )
        if success:
            self.log_result("Get Analytics Stats", True)
        else:
            self.log_result("Get Analytics Stats", False, f"Status: {status}")

        # Test product analytics if we have products
        if self.created_ids['products']:
            success, response, status = self.make_request(
                'GET', f'analytics/product/{self.created_ids["products"][0]}', token=self.user_token
            )
            if success:
                self.log_result("Get Product Analytics", True)
            else:
                self.log_result("Get Product Analytics", False, f"Status: {status}")

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        endpoints = [
            'public/supermarkets',
            'public/categories',
            'public/products'
        ]
        
        for endpoint in endpoints:
            success, response, status = self.make_request('GET', endpoint)
            if success:
                self.log_result(f"Get {endpoint.replace('public/', '').title()}", True)
            else:
                self.log_result(f"Get {endpoint.replace('public/', '').title()}", False, f"Status: {status}")

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete in reverse order due to dependencies
        for prod_id in self.created_ids['products']:
            self.make_request('DELETE', f'admin/products/{prod_id}', token=self.admin_token)
        
        for unit_id in self.created_ids['units']:
            self.make_request('DELETE', f'admin/units/{unit_id}', token=self.admin_token)
            
        for sm_id in self.created_ids['supermarkets']:
            self.make_request('DELETE', f'admin/supermarkets/{sm_id}', token=self.admin_token)
            
        for brand_id in self.created_ids['brands']:
            self.make_request('DELETE', f'admin/brands/{brand_id}', token=self.admin_token)
            
        for cat_id in self.created_ids['categories']:
            self.make_request('DELETE', f'admin/categories/{cat_id}', token=self.admin_token)

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting PriceHive Backend API Tests")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping admin tests")
            return False
            
        if not (self.test_user_registration() or self.test_user_login()):
            print("❌ User authentication failed - stopping user tests")
            return False

        self.test_get_me()

        # Session persistence test (Critical)
        print("\n🔐 Testing Session Persistence (Critical)...")
        self.test_session_persistence()

        # Admin CRUD tests
        self.test_admin_categories()
        self.test_admin_brands()
        self.test_admin_supermarkets()
        self.test_admin_units()
        self.test_admin_products()

        # User feature tests
        self.test_prices()
        self.test_social_features()
        self.test_shopping_lists()
        
        # Shopping list dynamic editing test (Critical)
        print("\n🛒 Testing Shopping List Dynamic Editing (Critical)...")
        self.test_shopping_list_dynamic_editing()
        
        self.test_analytics()
        
        # Public endpoint tests
        self.test_public_endpoints()

        # Cleanup
        self.cleanup_test_data()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return success_rate > 80  # Consider successful if >80% pass

def main():
    tester = PriceHiveAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())