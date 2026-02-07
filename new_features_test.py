import requests
import sys
import json
from datetime import datetime

class NewFeaturesAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Store created IDs for testing
        self.created_ids = {
            'products': [],
            'supermarkets': [],
            'alerts': []
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

    def setup_auth(self):
        """Setup authentication tokens"""
        # Admin login
        success, response, status = self.make_request(
            'POST', 'auth/login',
            data={"email": "admin@pricehive.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_result("Admin Login Setup", True)
        else:
            self.log_result("Admin Login Setup", False, f"Status: {status}")
            return False

        # User registration/login
        test_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response, status = self.make_request(
            'POST', 'auth/register',
            data={"email": test_email, "password": "test123", "name": "Test User"}
        )
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.log_result("User Registration Setup", True)
        else:
            self.log_result("User Registration Setup", False, f"Status: {status}")
            return False
        
        return True

    def test_alerts_endpoints(self):
        """Test new alerts system endpoints"""
        # Get existing products and supermarkets for testing
        success, products, status = self.make_request('GET', 'public/products', token=self.user_token)
        if not success or not products:
            self.log_result("Get Products for Alerts", False, "No products available")
            return
        
        success, supermarkets, status = self.make_request('GET', 'public/supermarkets', token=self.user_token)
        if not success or not supermarkets:
            self.log_result("Get Supermarkets for Alerts", False, "No supermarkets available")
            return

        product_id = products[0]['id']
        supermarket_id = supermarkets[0]['id']
        
        # Create alert
        success, response, status = self.make_request(
            'POST', 'alerts',
            data={
                "product_id": product_id,
                "supermarket_id": supermarket_id,
                "target_price": 2.50,
                "alert_type": "below"
            },
            token=self.user_token
        )
        if success and 'id' in response:
            alert_id = response['id']
            self.created_ids['alerts'].append(alert_id)
            self.log_result("Create Alert", True)
            
            # Get alerts
            success, response, status = self.make_request('GET', 'alerts', token=self.user_token)
            if success and isinstance(response, list):
                self.log_result("Get Alerts", True)
            else:
                self.log_result("Get Alerts", False, f"Status: {status}")
                
            # Delete alert
            success, response, status = self.make_request('DELETE', f'alerts/{alert_id}', token=self.user_token)
            if success:
                self.log_result("Delete Alert", True)
            else:
                self.log_result("Delete Alert", False, f"Status: {status}")
        else:
            self.log_result("Create Alert", False, f"Status: {status}, Response: {response}")

    def test_notifications_endpoints(self):
        """Test notifications system endpoints"""
        # Get notifications
        success, response, status = self.make_request('GET', 'notifications', token=self.user_token)
        if success and isinstance(response, list):
            self.log_result("Get Notifications", True)
        else:
            self.log_result("Get Notifications", False, f"Status: {status}")
        
        # Get unread count
        success, response, status = self.make_request('GET', 'notifications/unread-count', token=self.user_token)
        if success and 'count' in response:
            self.log_result("Get Unread Count", True)
        else:
            self.log_result("Get Unread Count", False, f"Status: {status}")
        
        # Mark all as read
        success, response, status = self.make_request('PUT', 'notifications/read-all', token=self.user_token)
        if success:
            self.log_result("Mark All Notifications Read", True)
        else:
            self.log_result("Mark All Notifications Read", False, f"Status: {status}")

    def test_gamification_endpoints(self):
        """Test gamification system endpoints"""
        # Get leaderboard
        success, response, status = self.make_request('GET', 'leaderboard', token=self.user_token)
        if success and isinstance(response, list):
            self.log_result("Get Leaderboard", True)
        else:
            self.log_result("Get Leaderboard", False, f"Status: {status}")
        
        # Get my points
        success, response, status = self.make_request('GET', 'my-points', token=self.user_token)
        if success and 'points' in response and 'rank' in response:
            self.log_result("Get My Points", True)
        else:
            self.log_result("Get My Points", False, f"Status: {status}")

    def test_search_endpoints(self):
        """Test search functionality"""
        # Search products
        success, response, status = self.make_request('GET', 'search/products?q=test', token=self.user_token)
        if success and isinstance(response, list):
            self.log_result("Search Products", True)
        else:
            self.log_result("Search Products", False, f"Status: {status}")
        
        # Search with category filter
        success, response, status = self.make_request('GET', 'search/products?category_id=test', token=self.user_token)
        if success and isinstance(response, list):
            self.log_result("Search Products with Category Filter", True)
        else:
            self.log_result("Search Products with Category Filter", False, f"Status: {status}")

    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        # Get existing products for testing
        success, products, status = self.make_request('GET', 'public/products', token=self.user_token)
        if success and products:
            product_id = products[0]['id']
            
            # Get product analytics
            success, response, status = self.make_request(
                'GET', f'analytics/product/{product_id}', token=self.user_token
            )
            if success:
                self.log_result("Get Product Analytics", True)
            else:
                self.log_result("Get Product Analytics", False, f"Status: {status}")
            
            # Compare product prices
            success, response, status = self.make_request(
                'GET', f'analytics/compare/{product_id}', token=self.user_token
            )
            if success:
                self.log_result("Compare Product Prices", True)
            else:
                self.log_result("Compare Product Prices", False, f"Status: {status}")
        else:
            self.log_result("Analytics Tests", False, "No products available for testing")

    def test_google_auth_endpoint(self):
        """Test Google OAuth endpoint structure (without actual Google session)"""
        # This will fail with 401 but we're testing the endpoint exists
        success, response, status = self.make_request(
            'POST', 'auth/google/session',
            data={"session_id": "fake_session_id"},
            expected_status=401  # Expected to fail with fake session
        )
        if status == 401:
            self.log_result("Google OAuth Endpoint Exists", True)
        else:
            self.log_result("Google OAuth Endpoint Exists", False, f"Unexpected status: {status}")

    def test_logout_endpoint(self):
        """Test logout endpoint"""
        success, response, status = self.make_request('POST', 'auth/logout', token=self.user_token)
        if success:
            self.log_result("Logout Endpoint", True)
        else:
            self.log_result("Logout Endpoint", False, f"Status: {status}")

    def run_all_tests(self):
        """Run all new feature tests"""
        print("🚀 Starting PriceHive New Features API Tests")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 60)

        if not self.setup_auth():
            print("❌ Authentication setup failed - stopping tests")
            return False

        # Test new features
        self.test_alerts_endpoints()
        self.test_notifications_endpoints()
        self.test_gamification_endpoints()
        self.test_search_endpoints()
        self.test_analytics_endpoints()
        self.test_google_auth_endpoint()
        self.test_logout_endpoint()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 New Features Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return success_rate > 80

def main():
    tester = NewFeaturesAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())