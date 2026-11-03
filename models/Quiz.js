
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        questions: [
            {
                questionText: {
                    type: String,
                    required: true
                },
                options: {
                    type: [String],
                    required: true
                },
                correctAnswer: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
