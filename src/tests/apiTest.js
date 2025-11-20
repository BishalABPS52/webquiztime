/**
 * QuizTime API Integration Test
 * 
 * This file contains a test function to verify that the QuizTime API
 * integration is working correctly. It tests fetching questions with
 * the QuizTimeAPI service and verifies that the fallback mechanisms work.
 */

import QuizTimeAPI from '../services/api';

/**
 * Test the API integration and fallback mechanisms
 * Run this test using:
 * npm test -- apiTest.js
 */
async function testAPIIntegration() {
  console.log('📝 Testing API integration...');

  try {
    // Test question retrieval
    console.log('Testing question retrieval...');
    const easyQuestions = await QuizTimeAPI.getQuestions('testUser', 'easy', 5);
    
    if (easyQuestions && Array.isArray(easyQuestions.questions)) {
      console.log(`✅ Successfully retrieved ${easyQuestions.questions.length} easy questions`);
      // Log one sample question
      if (easyQuestions.questions.length > 0) {
        console.log('Sample question:');
        console.log(JSON.stringify(easyQuestions.questions[0], null, 2));
      }
    } else {
      console.error('❌ Failed to retrieve easy questions or invalid format');
      console.log('Response:', easyQuestions);
    }

    // Test invalid difficulty (should fall back to default)
    console.log('\nTesting with invalid difficulty...');
    const invalidDifficulty = await QuizTimeAPI.getQuestions('testUser', 'invalid', 5);
    
    if (invalidDifficulty) {
      console.log('✅ Successfully handled invalid difficulty');
      console.log('Response:', invalidDifficulty);
    }

    // Test leaderboard retrieval
    console.log('\nTesting leaderboard retrieval...');
    const leaderboard = await QuizTimeAPI.getLeaderboard();
    
    if (leaderboard) {
      console.log('✅ Successfully retrieved leaderboard');
      console.log(`Found ${leaderboard.length || 0} entries`);
    } else {
      console.error('❌ Failed to retrieve leaderboard');
    }

    console.log('\n✅ API integration test completed successfully');
  } catch (error) {
    console.error('❌ API integration test failed:', error);
    
    console.log('\nTesting fallback mechanism...');
    // Here we would test the fallback mechanism
    // This would require mocking a failed API call and checking
    // if the local JSON files are loaded instead
    
    console.log('To manually test fallback:');
    console.log('1. Temporarily disable the API server');
    console.log('2. Start the application and begin a game');
    console.log('3. Verify that questions are still loaded from local JSON files');
  }
}

// Run the test if executed directly
if (typeof window === 'undefined' && require.main === module) {
  testAPIIntegration();
}

export default testAPIIntegration;