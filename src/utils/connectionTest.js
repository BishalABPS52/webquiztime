// Test file to check API connection
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://quiztime-backend-efv0.onrender.com";

async function checkConnection() {
  console.log("Testing connection to backend API...");
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Test the root endpoint
    console.log("\nTesting root endpoint...");
    const rootResponse = await fetch(API_URL);
    if (!rootResponse.ok) {
      throw new Error(`Root endpoint failed: ${rootResponse.status} ${rootResponse.statusText}`);
    }
    const rootData = await rootResponse.json();
    console.log("✅ Root endpoint response:", rootData);
    
    // Test the API info endpoint
    console.log("\nTesting API info endpoint...");
    const apiResponse = await fetch(`${API_URL}/api`);
    if (!apiResponse.ok) {
      throw new Error(`API info endpoint failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    const apiData = await apiResponse.json();
    console.log("✅ API info endpoint response:", apiData);
    
    // Test the health endpoint
    console.log("\nTesting health endpoint...");
    const healthResponse = await fetch(`${API_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health endpoint failed: ${healthResponse.status} ${healthResponse.statusText}`);
    }
    const healthData = await healthResponse.json();
    console.log("✅ Health endpoint response:", healthData);
    
    // Test the lifelines endpoint
    console.log("\nTesting lifelines endpoint...");
    const lifelinesResponse = await fetch(`${API_URL}/api/lifelines`);
    if (!lifelinesResponse.ok) {
      throw new Error(`Lifelines endpoint failed: ${lifelinesResponse.status} ${lifelinesResponse.statusText}`);
    }
    const lifelinesData = await lifelinesResponse.json();
    console.log("✅ Lifelines endpoint response:", lifelinesData);
    
    // Test the leaderboard endpoint
    console.log("\nTesting leaderboard endpoint...");
    const leaderboardResponse = await fetch(`${API_URL}/api/leaderboard`);
    if (!leaderboardResponse.ok) {
      throw new Error(`Leaderboard endpoint failed: ${leaderboardResponse.status} ${leaderboardResponse.statusText}`);
    }
    const leaderboardData = await leaderboardResponse.json();
    console.log("✅ Leaderboard endpoint response:", leaderboardData);
    
    console.log("\n✅✅✅ All tests passed! Frontend and backend are connected successfully! ✅✅✅");
    return { success: true, message: "Connection successful" };
  } catch (error) {
    console.error("\n❌ Connection test failed:", error);
    return { success: false, error: error.message };
  }
}

// Export for use in other files
export { checkConnection };

// Run the test when this file is executed directly
if (typeof window !== 'undefined') {
  checkConnection();
}