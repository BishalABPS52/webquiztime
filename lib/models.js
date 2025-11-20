import mongoose from 'mongoose';

// Question Schema
const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  correct_answer: {
    type: String,
    required: true
  },
  incorrect_answers: {
    type: [String],
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  category: {
    type: String,
    default: 'general'
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  score: {
    type: Number,
    default: 0
  },
  questionsAnswered: {
    type: [String], // Array of question IDs
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Stats Schema
const statsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    default: function() { return this.username; }
  },
  score: {
    type: Number,
    default: 0
  },
  questionsAnswered: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  averageTimePerQuestion: {
    type: Number,
    default: 0
  },
  averageCompletionTime: {
    type: String,
    default: '0:00'
  },
  totalTime: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesCompleted: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  totalPrizeMoney: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: 'normal'
  },
  lifelinesUsed: {
    type: Object,
    default: {}
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  }
});

// Leaderboard Entry Schema
const leaderboardSchema = new mongoose.Schema({
  entries: [{
    userId: {
      type: String,
      required: true
    },
    playerName: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    prizeWon: {
      type: Number,
      required: true,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 15
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    completionDate: {
      type: String,
      default: function() { return new Date().toISOString(); }
    },
    completionTime: {
      type: Number,
      default: 0
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0
    },
    totalTime: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

// Create models based on schemas, handling Next.js API routes requirements
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);
const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);

export { Question, User, Stats, Leaderboard };