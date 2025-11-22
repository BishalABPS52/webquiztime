import connectToDatabase from '../../lib/mongodb';
import { Stats, User, Leaderboard } from '../../lib/models';

/**
 * API endpoint to save and retrieve user stats
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Connect to MongoDB
  await connectToDatabase();

  // Handle POST request to save stats
  if (req.method === 'POST') {
    try {
      const { 
        username, 
        score, 
        questionsAnswered, 
        correctAnswers,
        wrongAnswers,
        averageTimePerQuestion,
        totalTime,
        level,
        lifelinesUsed
      } = req.body;

      // Validate required fields
      if (!username || score === undefined) {
        return res.status(400).json({ error: 'Username and score are required' });
      }

      const gameStats = {
        score,
        questionsAnswered: questionsAnswered || 0,
        correctAnswers: correctAnswers || 0,
        wrongAnswers: wrongAnswers || 0,
        averageTimePerQuestion: averageTimePerQuestion || 0,
        totalTime: totalTime || 0,
        level: level || 'normal',
        lifelinesUsed: lifelinesUsed || {},
        lastPlayed: new Date()
      };

      // Update user stats in MongoDB
      let stats = await Stats.findOne({ username });
      if (stats) {
        // Update existing stats - accumulate values
        stats.score = Math.max(stats.score || 0, gameStats.score); // Keep highest score
        stats.questionsAnswered = (stats.questionsAnswered || 0) + (gameStats.questionsAnswered || 0);
        stats.correctAnswers = (stats.correctAnswers || 0) + (gameStats.correctAnswers || 0);
        stats.wrongAnswers = (stats.wrongAnswers || 0) + (gameStats.wrongAnswers || 0);
        stats.totalTime = (stats.totalTime || 0) + (gameStats.totalTime || 0);
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.gamesWon = (stats.gamesWon || 0) + (gameStats.gameCompleted ? 1 : 0);
        stats.gamesCompleted = (stats.gamesCompleted || 0) + (gameStats.gamesCompleted || 0);
        stats.totalEarnings = (stats.totalEarnings || 0) + (gameStats.score || 0);
        stats.totalPrizeMoney = (stats.totalPrizeMoney || 0) + (gameStats.totalPrizeMoney || gameStats.score || 0);
        stats.averageCompletionTime = gameStats.averageCompletionTime;
        stats.accuracy = stats.correctAnswers > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;
        
        // Recalculate average time per question
        stats.averageTimePerQuestion = stats.questionsAnswered > 0 ? 
          stats.totalTime / stats.questionsAnswered : 0;
        
        // Update lifelines used - accumulate
        if (!stats.lifelinesUsed) stats.lifelinesUsed = {};
        Object.keys(gameStats.lifelinesUsed || {}).forEach(lifeline => {
          stats.lifelinesUsed[lifeline] = (stats.lifelinesUsed[lifeline] || 0) + 
            (gameStats.lifelinesUsed[lifeline] || 0);
        });
        
        stats.lastPlayed = new Date();
        await stats.save();
      } else {
        // Create new stats
        const newStats = {
          username,
          ...gameStats,
          gamesPlayed: 1,
          gamesWon: gameStats.gameCompleted ? 1 : 0,
          totalEarnings: gameStats.score || 0
        };
        stats = new Stats(newStats);
        await stats.save();
      }

      // Update user's score
      let user = await User.findOne({ username });
      if (user) {
        user.score = Math.max(user.score, score); // Only update if new score is higher
        user.lastActivity = new Date();
        await user.save();
      } else {
        user = new User({
          username,
          score,
          lastActivity: new Date()
        });
        await user.save();
      }

      // Update leaderboard
      let leaderboard = await Leaderboard.findOne({});
      if (!leaderboard) {
        leaderboard = new Leaderboard({ entries: [] });
      }

      const leaderboardEntry = {
        username,
        score,
        questionsAnswered: questionsAnswered || 0,
        correctAnswers: correctAnswers || 0,
        averageTimePerQuestion: averageTimePerQuestion || 0,
        totalTime: totalTime || 0,
        totalEarnings: stats.totalEarnings || score || 0,
        date: new Date()
      };

      const existingEntryIndex = leaderboard.entries.findIndex(entry => entry.username === username);
      if (existingEntryIndex >= 0) {
        // Update if better score or higher total earnings
        const existingEntry = leaderboard.entries[existingEntryIndex];
        if (leaderboardEntry.score > existingEntry.score || 
            leaderboardEntry.totalEarnings > (existingEntry.totalEarnings || existingEntry.score || 0)) {
          leaderboard.entries[existingEntryIndex] = leaderboardEntry;
        }
      } else {
        leaderboard.entries.push(leaderboardEntry);
      }

      // Sort by total earnings first, then by score (both descending)
      leaderboard.entries.sort((a, b) => {
        const aEarnings = a.totalEarnings || a.score || 0;
        const bEarnings = b.totalEarnings || b.score || 0;
        if (bEarnings !== aEarnings) return bEarnings - aEarnings;
        return (b.score || 0) - (a.score || 0);
      });

      // Keep top 100 only
      if (leaderboard.entries.length > 100) {
        leaderboard.entries = leaderboard.entries.slice(0, 100);
      }

      await leaderboard.save();

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving stats:', error);
      res.status(500).json({ error: 'Server error saving stats' });
    }
  } 
  // Handle GET request to get stats for a specific user
  else if (req.method === 'GET') {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Try to read from stats JSON file for specific user first
    try {
      console.log('Trying to read stats JSON file for:', username);
      const fs = require('fs');
      const path = require('path');
      const jsonPath = '/home/bishal-shrestha/web dev/backwebquiztime/data/stats.json';
      
      if (fs.existsSync(jsonPath)) {
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const parsedData = JSON.parse(jsonData);
        
        // Find specific user in stats JSON
        if (parsedData.users && Array.isArray(parsedData.users)) {
          const userStats = parsedData.users.find(user => 
            user.username === username || user.userId === username
          );
          
          if (userStats) {
            console.log('User stats found in JSON:', userStats);
            return res.status(200).json({ stats: userStats });
          }
        }
        
        console.log('User not found in stats JSON, trying backend server...');
      }
    } catch (jsonError) {
      console.error('Error reading stats JSON file:', jsonError.message);
    }

    // Try to fetch from production backend server as fallback
    try {
      const backendURL = process.env.NEXT_PUBLIC_API_URL || 'https://quiztime-backend-efv0.onrender.com';
      console.log('Trying to fetch stats from backend server for:', username, 'at', backendURL);
      const backendResponse = await fetch(`${backendURL}/api/stats/${username}`);
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('Backend stats data received:', backendData);
        // Only return backend data if it has meaningful stats
        if (backendData.stats && (backendData.stats.score > 0 || backendData.stats.questionsAnswered > 0)) {
          return res.status(200).json(backendData);
        }
      }
    } catch (backendError) {
      console.error('Backend server not available for stats:', backendError.message);
    }

    // Fallback to MongoDB
    try {
      console.log('Trying MongoDB for stats...');
      // Connect to MongoDB
      await connectToDatabase();
      
      // Get user stats
      const stats = await Stats.findOne({ username });

      if (!stats) {
        return res.status(200).json({ 
          stats: {
            score: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            averageTimePerQuestion: 0,
            totalTime: 0,
            lifelinesUsed: {}
          }
        });
      }

      res.status(200).json({ stats });
    } catch (error) {
      console.error('Error fetching stats from all sources:', error);
      res.status(500).json({ error: 'Server error fetching stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}