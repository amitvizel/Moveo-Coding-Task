# AI Model Training & Improvement Process

This document outlines how user feedback collected from the Crypto Advisor Dashboard is utilized to improve the AI's recommendations and content generation.

## 1. Data Collection

We collect explicit user feedback via the "Thumbs Up" / "Thumbs Down" buttons on:
- **AI Insights**: Assessing the quality, relevance, and accuracy of the daily analysis.
- **Market News**: determining which news sources and topics are most relevant to the user.
- **Memes**: Understanding user humor and engagement.

Data points stored:
- `userId`: To personalize individual models (optional) or segment users.
- `contentType`: The category of the content.
- `contentId`: Reference to the specific piece of content.
- `vote`: The signal (Positive/Negative).
- `createdAt`: Timestamp to analyze trends over time.

## 2. Improvement Strategy: Reinforcement Learning from Human Feedback (RLHF)

The feedback loop follows these stages:

### A. Dataset Construction
Periodically, we export the feedback data to create a labeled dataset.
- **Input**: The context provided to the AI (e.g., "User likes Bitcoin, moderate risk investor") + Market Data.
- **Output**: The generated insight.
- **Label**: The user's vote (Reward/Penalty).

### B. Fine-Tuning (Supervised Learning)
We filter for high-quality outputs (Thumbs Up) and fine-tune the LLM on these examples. This teaches the model to mimic the style and content that users find helpful.

### C. Reward Modeling (RLHF)
For more advanced improvement:
1. **Reward Model**: We train a separate "Reward Model" to predict whether a user will upvote a given insight.
2. **PPO (Proximal Policy Optimization)**: We use the Reward Model to train the main generation policy. The model generates multiple candidate insights, the Reward Model scores them, and the policy is updated to maximize the expected score.

## 3. Personalization

Beyond global model improvements, feedback is used for immediate personalization:
- **News Feed**: If a user consistently downvotes news from a specific domain (e.g., "FUD Daily"), the recommendation algorithm lowers the weight of that source for that user.
- **Insight Style**: If a user upvotes "technical" analysis but downvotes "sentiment" analysis, the prompt generation for that user is adjusted to request more technical details.

## 4. Continuous Evaluation

We monitor the **Upvote Rate** as a key performance indicator (KPI).
- **A/B Testing**: We can deploy two versions of the prompt/model.
- **Analysis**: We compare the Upvote Rate between Group A and Group B to decide which model is better.

---
*This process ensures that the Crypto Advisor evolves from a generic tool into a highly personalized expert assistant.*
