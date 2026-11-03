
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Quiz = require("./models/Quiz");

const app = express();
app.use(express.static("public"));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Online Quiz System Backend is Running!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend API is working!"
    });
});

// Create a quiz
app.post("/api/quizzes", async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        if (!title || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Title and at least one question are required."
            });
        }

        const quiz = new Quiz({
            title,
            description,
            questions
        });

        await quiz.save();

        res.status(201).json({
            success: true,
            message: "Quiz created successfully!",
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create quiz.",
            error: error.message
        });
    }
});

// Get all quizzes (hide correct answers)
app.get("/api/quizzes", async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .select("-questions.correctAnswer");

        res.json({
            success: true,
            quizzes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch quizzes."
        });
    }
});

// Get one quiz by ID (hide correct answers)
app.get("/api/quizzes/:id", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .select("-questions.correctAnswer");

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });
        }

        res.json({
            success: true,
            quiz
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid quiz ID."
        });
    }
});

// Start server after connecting to MongoDB
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

// Submit a quiz and calculate score
app.post("/api/quizzes/:id/submit", async (req, res) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be provided as an array."
            });
        }

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });
        }

        let score = 0;

        quiz.questions.forEach((question, index) => {
            if (
                answers[index] &&
                answers[index] === question.correctAnswer
            ) {
                score++;
            }
        });

        res.json({
            success: true,
            message: "Quiz submitted successfully!",
            totalQuestions: quiz.questions.length,
            correctAnswers: score,
            wrongAnswers: quiz.questions.length - score,
            percentage: Math.round(
                (score / quiz.questions.length) * 100
            )
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Unable to submit quiz."
        });
    }
});

startServer();
