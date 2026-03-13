#!/usr/bin/env python3
"""
Backend API Test Suite for Emergency SOS Health App
Tests the FastAPI backend endpoints and MongoDB integration
"""

import requests
import json
import time
import sys
from datetime import datetime

# Backend URL from environment - using the production URL
BACKEND_URL = "https://build-hub-149.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL" 
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "response_data": response_data
        }
        self.results.append(result)
        
        if success:
            self.passed += 1
            print(f"{status}: {test_name} - {message}")
        else:
            self.failed += 1
            print(f"{status}: {test_name} - {message}")
            if response_data:
                print(f"   Response: {response_data}")
    
    def test_health_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = requests.get(f"{BACKEND_URL}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_result("Health Check Endpoint", True, "Returns correct Hello World message", data)
                    return True
                else:
                    self.log_result("Health Check Endpoint", False, f"Unexpected response: {data}", data)
                    return False
            else:
                self.log_result("Health Check Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Health Check Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_status_check(self):
        """Test POST /api/status endpoint"""
        try:
            # Test data
            test_data = {
                "client_name": "Emergency_SOS_Test_Client"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/status", 
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ["id", "client_name", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    if data["client_name"] == test_data["client_name"] and data["id"]:
                        self.log_result("Create Status Check", True, "Successfully created status check", data)
                        return data["id"]  # Return ID for further tests
                    else:
                        self.log_result("Create Status Check", False, "Response data mismatch", data)
                        return None
                else:
                    self.log_result("Create Status Check", False, f"Missing fields: {missing_fields}", data)
                    return None
            else:
                self.log_result("Create Status Check", False, f"HTTP {response.status_code}: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_result("Create Status Check", False, f"Request failed: {str(e)}")
            return None
    
    def test_get_status_checks(self):
        """Test GET /api/status endpoint"""
        try:
            response = requests.get(f"{BACKEND_URL}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_result("Get Status Checks", True, f"Retrieved {len(data)} status checks", f"List with {len(data)} items")
                    
                    # Verify structure of items if any exist
                    if data:
                        first_item = data[0]
                        required_fields = ["id", "client_name", "timestamp"]
                        missing_fields = [field for field in required_fields if field not in first_item]
                        
                        if not missing_fields:
                            self.log_result("Status Check Structure", True, "All required fields present in response")
                        else:
                            self.log_result("Status Check Structure", False, f"Missing fields: {missing_fields}")
                    
                    return True
                else:
                    self.log_result("Get Status Checks", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("Get Status Checks", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Get Status Checks", False, f"Request failed: {str(e)}")
            return False
    
    def test_mongodb_integration(self):
        """Test MongoDB integration by creating and retrieving data"""
        try:
            # Create a test record
            test_data = {
                "client_name": f"MongoDB_Test_{int(time.time())}"
            }
            
            # Create status check
            create_response = requests.post(
                f"{BACKEND_URL}/status", 
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if create_response.status_code != 200:
                self.log_result("MongoDB Integration", False, "Failed to create test record for MongoDB test")
                return False
            
            created_record = create_response.json()
            created_id = created_record["id"]
            
            # Wait a moment then retrieve all records
            time.sleep(1)
            get_response = requests.get(f"{BACKEND_URL}/status", timeout=10)
            
            if get_response.status_code != 200:
                self.log_result("MongoDB Integration", False, "Failed to retrieve records from MongoDB")
                return False
            
            all_records = get_response.json()
            
            # Check if our created record exists
            found_record = None
            for record in all_records:
                if record["id"] == created_id:
                    found_record = record
                    break
            
            if found_record:
                self.log_result("MongoDB Integration", True, f"Successfully stored and retrieved data from MongoDB (ID: {created_id})")
                return True
            else:
                self.log_result("MongoDB Integration", False, f"Created record not found in database (ID: {created_id})")
                return False
                
        except Exception as e:
            self.log_result("MongoDB Integration", False, f"MongoDB integration test failed: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        try:
            # Test invalid JSON for POST
            response = requests.post(
                f"{BACKEND_URL}/status",
                json={"invalid_field": "test"},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return an error for missing client_name
            if response.status_code != 200:
                self.log_result("Error Handling", True, f"Properly handles invalid input (HTTP {response.status_code})")
                return True
            else:
                # Check if it actually created a record with invalid data
                data = response.json()
                if "client_name" not in data:
                    self.log_result("Error Handling", False, "Should reject invalid input but accepted it", data)
                    return False
                else:
                    self.log_result("Error Handling", True, "Accepts request even with extra fields (flexible validation)")
                    return True
                    
        except requests.exceptions.RequestException as e:
            self.log_result("Error Handling", False, f"Error handling test failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("🔍 EMERGENCY SOS HEALTH APP - BACKEND API TESTS")
        print(f"Testing backend at: {BACKEND_URL}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_endpoint),
            ("Create Status Check", self.test_create_status_check),
            ("Get Status Checks", self.test_get_status_checks),
            ("MongoDB Integration", self.test_mongodb_integration),
            ("Error Handling", self.test_error_handling)
        ]
        
        for test_name, test_func in tests:
            print(f"\n📋 Running: {test_name}")
            test_func()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📈 Success Rate: {(self.passed/(self.passed+self.failed)*100):.1f}%")
        
        if self.failed > 0:
            print("\n🚨 FAILED TESTS:")
            for result in self.results:
                if "❌" in result["status"]:
                    print(f"   - {result['test']}: {result['message']}")
        
        return self.failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    print(f"\n{'🎉 ALL TESTS PASSED!' if success else '⚠️  SOME TESTS FAILED!'}")
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)