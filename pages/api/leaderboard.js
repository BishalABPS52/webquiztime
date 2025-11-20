import connectToDatabase from '../../lib/mongodb';
import { Leaderboard } from '../../lib/models';

/**
 * API endpoint to get and save leaderboard entries
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Handle POST request to save leaderboard entry
  if (req.method === 'POST') {
    try {
      // Connect to MongoDB
      await connectToDatabase();
      
      const { userId, playerName, prizeWon, questionsAnswered, totalQuestions, completionDate, completionTime } = req.body;
      
      // Validate required fields
      if (!userId || !playerName || prizeWon === undefined) {
        return res.status(400).json({ error: 'userId, playerName, and prizeWon are required' });
      }
      
      // Get or create leaderboard
      let leaderboard = await Leaderboard.findOne({});
      if (!leaderboard) {
        leaderboard = new Leaderboard({ entries: [] });
      }
      
      const leaderboardEntry = {
        userId,
        playerName,
        prizeWon,
        questionsAnswered: questionsAnswered || 0,
        totalQuestions: totalQuestions || 15,
        completionDate: completionDate || new Date().toISOString(),
        completionTime: completionTime || 0,
        date: new Date()
      };
      
      // Check if player already exists in leaderboard
      const existingEntryIndex = leaderboard.entries.findIndex(entry => 
        entry.userId === userId || entry.playerName === playerName
      );
      
      if (existingEntryIndex >= 0) {
        // Update if this is a better performance
        const existingEntry = leaderboard.entries[existingEntryIndex];
        const shouldUpdate = 
          leaderboardEntry.prizeWon > (existingEntry.prizeWon || 0) ||
          (leaderboardEntry.prizeWon === (existingEntry.prizeWon || 0) && 
           leaderboardEntry.questionsAnswered > (existingEntry.questionsAnswered || 0)) ||
          (leaderboardEntry.prizeWon === (existingEntry.prizeWon || 0) && 
           leaderboardEntry.questionsAnswered === (existingEntry.questionsAnswered || 0) &&
           leaderboardEntry.completionTime < (existingEntry.completionTime || Infinity));
        
        if (shouldUpdate) {
          leaderboard.entries[existingEntryIndex] = leaderboardEntry;
        }
      } else {
        leaderboard.entries.push(leaderboardEntry);
      }
      
      // Sort leaderboard: highest prize → most questions → fastest time
      leaderboard.entries.sort((a, b) => {
        // Primary: Prize won (descending)
        if ((b.prizeWon || 0) !== (a.prizeWon || 0)) return (b.prizeWon || 0) - (a.prizeWon || 0);
        // Secondary: Questions answered (descending)
        if ((b.questionsAnswered || 0) !== (a.questionsAnswered || 0)) return (b.questionsAnswered || 0) - (a.questionsAnswered || 0);
        // Tertiary: Completion time (ascending - faster is better)
        return (a.completionTime || Infinity) - (b.completionTime || Infinity);
      });
      
      // Keep top 100 only
      if (leaderboard.entries.length > 100) {
        leaderboard.entries = leaderboard.entries.slice(0, 100);
      }
      
      await leaderboard.save();
      
      res.status(200).json({ 
        success: true, 
        message: 'Leaderboard entry saved successfully',
        position: leaderboard.entries.findIndex(entry => 
          entry.userId === userId || entry.playerName === playerName
        ) + 1
      });
    } catch (error) {
      console.error('Error saving leaderboard entry:', error);
      res.status(500).json({ error: 'Server error saving leaderboard entry' });
    }
  }
  // Handle GET request to fetch leaderboard
  else if (req.method === 'GET') {
    // Try to fetch from production backend server first
    try {
      const backendURL = process.env.NEXT_PUBLIC_API_URL || 'https://quiztime-backend-efv0.onrender.com';
      console.log('Trying to fetch from backend server:', backendURL);
      const backendResponse = await fetch(`${backendURL}/api/leaderboard`);
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('Backend data received:', backendData);
        
        // Rank all players properly: highest prize → most questions → fastest time
        if (backendData.leaderboard && Array.isArray(backendData.leaderboard)) {
          const rankedLeaderboard = backendData.leaderboard.sort((a, b) => {
            // Primary: Prize won (descending)
            if (b.prizeWon !== a.prizeWon) return b.prizeWon - a.prizeWon;
            // Secondary: Questions answered (descending)
            if (b.questionsAnswered !== a.questionsAnswered) return b.questionsAnswered - a.questionsAnswered;
            // Tertiary: Completion time (ascending - faster is better)
            return a.completionTime - b.completionTime;
          });
          
          return res.status(200).json({ leaderboard: rankedLeaderboard });
        }
        
        return res.status(200).json(backendData);
      }
    } catch (backendError) {
      console.error('Backend server not available:', backendError.message);
    }
    
    // Fallback to JSON file if backend not available
    try {
      console.log('Trying to read JSON file...');
      const fs = require('fs');
      const path = require('path');
      const jsonPath = '/home/bishal-shrestha/web dev/backwebquiztime/data/leaderboard.json';
      
      if (fs.existsSync(jsonPath)) {
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const parsedData = JSON.parse(jsonData);
        
        // Rank all players properly from JSON data
        if (parsedData.leaderboard && Array.isArray(parsedData.leaderboard)) {
          const rankedLeaderboard = parsedData.leaderboard.sort((a, b) => {
            // Primary: Prize won (descending)
            if (b.prizeWon !== a.prizeWon) return b.prizeWon - a.prizeWon;
            // Secondary: Questions answered (descending)
            if (b.questionsAnswered !== a.questionsAnswered) return b.questionsAnswered - a.questionsAnswered;
            // Tertiary: Completion time (ascending - faster is better)
            return a.completionTime - b.completionTime;
          });
          
          console.log('JSON data ranked:', rankedLeaderboard);
          return res.status(200).json({ leaderboard: rankedLeaderboard });
        }
        
        console.log('JSON data loaded:', parsedData);
        return res.status(200).json(parsedData);
      }
    } catch (jsonError) {
      console.error('Error reading JSON file:', jsonError.message);
    }
    
    // Fallback to MongoDB
    try {
      console.log('Trying MongoDB...');
      // Connect to MongoDB
      await connectToDatabase();

      // Get leaderboard from MongoDB
      let leaderboard = await Leaderboard.findOne({});

      // If no leaderboard exists, create an empty one
      if (!leaderboard) {
        leaderboard = { entries: [] };
      }

      console.log('MongoDB data:', leaderboard.entries);
      // Return leaderboard entries
      res.status(200).json({ leaderboard: leaderboard.entries });
    } catch (error) {
      console.error('Error fetching leaderboard from all sources:', error);
      res.status(500).json({ error: 'Server error fetching leaderboard' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}