import connectToDatabase from '../../../lib/mongodb';
import { Stats, User, Leaderboard } from '../../../lib/models';
import jwt from 'jsonwebtoken';

/**
 * API endpoint to handle game completion
 * Saves comprehensive stats and updates leaderboard
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Try to extract token from Authorization header, but don't require it for testing
    const token = req.headers.authorization?.replace('Bearer ', '');
    let decoded = null;
    let username = null;
    
    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        username = decoded.username;
      } catch (error) {
        console.warn('Invalid token, but continuing without auth for testing');
      }
    }
    
    // Get username from request body if not from token
    if (!username) {
      username = req.body.username;
      if (!username) {
        return res.status(400).json({ error: 'Username is required either in token or request body' });
      }
    }
    
    const { 
      questionsAnswered,
      correctAnswers,
      totalQuestions,
      finalPrize,
      completionTime,
      gameCompleted,
      score,
      wrongAnswers,
      averageTimePerQuestion,
      totalTime,
      level,
      lifelinesUsed,
      totalEarnings,
      gamesPlayed,
      gamesWon
    } = req.body;

    // Validate required fields
    if (!username || score === undefined) {
      return res.status(400).json({ error: 'Username and score are required' });
    }

    // Parse completion time if it's a string
    let totalTimeInSeconds = totalTime;
    if (typeof completionTime === 'string' && completionTime.includes(':')) {
      const [minutes, seconds] = completionTime.split(':').map(Number);
      totalTimeInSeconds = (minutes * 60) + seconds;
    }

    const gameStats = {
      score: finalPrize || score || 0,
      questionsAnswered: questionsAnswered || 0,
      correctAnswers: correctAnswers || 0,
      wrongAnswers: wrongAnswers || ((questionsAnswered || 0) - (correctAnswers || 0)),
      averageTimePerQuestion: averageTimePerQuestion || 0,
      averageCompletionTime: completionTime || `${Math.floor(totalTimeInSeconds / 60)}:${(totalTimeInSeconds % 60).toString().padStart(2, '0')}`,
      totalTime: totalTimeInSeconds || 0,
      level: level || 'normal',
      lifelinesUsed: lifelinesUsed || {},
      lastPlayed: new Date(),
      gamesPlayed: 1,
      gamesWon: gameCompleted ? 1 : 0,
      gamesCompleted: gameCompleted ? 1 : 0,
      totalEarnings: finalPrize || score || 0,
      totalPrizeMoney: finalPrize || score || 0,
      accuracy: correctAnswers > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0
    };

    // Update user stats in MongoDB
    let stats = await Stats.findOne({ username });
    if (stats) {
      // Update existing stats - accumulate values
      stats.score = Math.max(stats.score, gameStats.score); // Keep highest score
      stats.questionsAnswered = (stats.questionsAnswered || 0) + gameStats.questionsAnswered;
      stats.correctAnswers = (stats.correctAnswers || 0) + gameStats.correctAnswers;
      stats.wrongAnswers = (stats.wrongAnswers || 0) + gameStats.wrongAnswers;
      stats.totalTime = (stats.totalTime || 0) + gameStats.totalTime;
      stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
      stats.gamesWon = (stats.gamesWon || 0) + (gameCompleted ? 1 : 0);
      stats.gamesCompleted = (stats.gamesCompleted || 0) + (gameCompleted ? 1 : 0);
      stats.totalEarnings = (stats.totalEarnings || 0) + gameStats.totalEarnings;
      stats.totalPrizeMoney = (stats.totalPrizeMoney || 0) + gameStats.totalPrizeMoney;
      stats.averageCompletionTime = gameStats.averageCompletionTime;
      stats.accuracy = stats.correctAnswers > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;
      
      // Recalculate average time per question
      stats.averageTimePerQuestion = stats.questionsAnswered > 0 ? 
        stats.totalTime / stats.questionsAnswered : 0;
      
      // Update lifelines used
      if (!stats.lifelinesUsed) stats.lifelinesUsed = {};
      Object.keys(gameStats.lifelinesUsed || {}).forEach(lifeline => {
        stats.lifelinesUsed[lifeline] = (stats.lifelinesUsed[lifeline] || 0) + 
          (gameStats.lifelinesUsed[lifeline] || 0);
      });
      
      stats.lastPlayed = new Date();
      await stats.save();
    } else {
      // Create new stats
      stats = new Stats({
        username,
        ...gameStats
      });
      await stats.save();
    }

    // Update user's score
    let user = await User.findOne({ username });
    if (user) {
      user.score = Math.max(user.score, gameStats.score); // Only update if new score is higher
      user.lastActivity = new Date();
      await user.save();
    }

    // Update leaderboard
    let leaderboard = await Leaderboard.findOne({});
    if (!leaderboard) {
      leaderboard = new Leaderboard({ entries: [] });
    }

    const leaderboardEntry = {
      userId: decoded.userId || username,
      playerName: username,
      prizeWon: gameStats.score,
      questionsAnswered: gameStats.questionsAnswered,
      totalQuestions: totalQuestions || 15,
      completionDate: new Date().toISOString(),
      completionTime: gameStats.totalTime / 60, // Convert seconds to minutes
      // Legacy fields for backward compatibility
      username,
      score: gameStats.score,
      correctAnswers: gameStats.correctAnswers,
      averageTimePerQuestion: gameStats.averageTimePerQuestion,
      totalTime: gameStats.totalTime,
      totalEarnings: gameStats.totalEarnings,
      date: new Date()
    };

    const existingEntryIndex = leaderboard.entries.findIndex(entry => 
      entry.username === username || entry.playerName === username
    );
    if (existingEntryIndex >= 0) {
      // Update if better performance using new ranking criteria
      const existingEntry = leaderboard.entries[existingEntryIndex];
      const shouldUpdate = 
        leaderboardEntry.prizeWon > (existingEntry.prizeWon || existingEntry.score || 0) ||
        (leaderboardEntry.prizeWon === (existingEntry.prizeWon || existingEntry.score || 0) && 
         leaderboardEntry.questionsAnswered > (existingEntry.questionsAnswered || 0)) ||
        (leaderboardEntry.prizeWon === (existingEntry.prizeWon || existingEntry.score || 0) && 
         leaderboardEntry.questionsAnswered === (existingEntry.questionsAnswered || 0) &&
         leaderboardEntry.completionTime < (existingEntry.completionTime || Infinity));
      
      if (shouldUpdate) {
        leaderboard.entries[existingEntryIndex] = leaderboardEntry;
      }
    } else {
      leaderboard.entries.push(leaderboardEntry);
    }

    // Sort by new ranking criteria: prize won → questions answered → completion time
    leaderboard.entries.sort((a, b) => {
      // Primary: Prize won (descending)
      const aPrize = a.prizeWon || a.totalEarnings || a.score || 0;
      const bPrize = b.prizeWon || b.totalEarnings || b.score || 0;
      if (bPrize !== aPrize) return bPrize - aPrize;
      
      // Secondary: Questions answered (descending)
      const aQuestions = a.questionsAnswered || 0;
      const bQuestions = b.questionsAnswered || 0;
      if (bQuestions !== aQuestions) return bQuestions - aQuestions;
      
      // Tertiary: Completion time (ascending - faster is better)
      const aTime = a.completionTime || a.totalTime || Infinity;
      const bTime = b.completionTime || b.totalTime || Infinity;
      return aTime - bTime;
    });

    // Keep top 100 only
    if (leaderboard.entries.length > 100) {
      leaderboard.entries = leaderboard.entries.slice(0, 100);
    }

    await leaderboard.save();

    res.status(200).json({ 
      success: true, 
      message: 'Game results saved successfully',
      stats: stats,
      leaderboardPosition: leaderboard.entries.findIndex(entry => entry.username === username) + 1
    });
  } catch (error) {
    console.error('Error saving game completion:', error);
    res.status(500).json({ error: 'Server error saving game results' });
  }
}