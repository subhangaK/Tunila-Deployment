from flask import Flask, request, jsonify
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
import json
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route("/")
def home():
    return "Flask API is running!"

# MongoDB Connection
client = MongoClient("mongodb+srv://subhanga:znuht1699@cluster0.xs6op.mongodb.net")
db = client["FYP_DEVELOPMENT"]
songs_collection = db["songs"]

# Helper function to serialize ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)  # Convert ObjectId to string
        return super().default(obj)

# API to get recommended songs
@app.route("/api/recommend/<user_id>", methods=["GET"])
def get_recommendations(user_id):
    try:
        # Get songs liked by the user
        liked_songs = list(songs_collection.find({"likedBy": user_id}))
        if not liked_songs:
            # If no liked songs, return a random selection of songs
            all_songs = list(songs_collection.find())
            random_songs = all_songs[:12]  # Return first 12 songs as a fallback
            random_songs_json = json.loads(json.dumps(random_songs, cls=JSONEncoder))
            return jsonify({"success": True, "recommended_songs": random_songs_json})

        # Get all songs from the database
        all_songs = list(songs_collection.find())

        # Create song metadata (title + genre)
        song_metadata = [song["title"] + " " + song["genre"] for song in all_songs]
        liked_metadata = [song["title"] + " " + song["genre"] for song in liked_songs]

        # TF-IDF Vectorization
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(song_metadata)
        liked_matrix = vectorizer.transform(liked_metadata)
        
        # Compute cosine similarity between liked songs and all songs
        similarity_scores = cosine_similarity(liked_matrix, tfidf_matrix)

        # Get top recommendations
        recommended_indices = similarity_scores.mean(axis=0).argsort()[::-1]  # Sort in descending order
        recommended_songs = [all_songs[i] for i in recommended_indices]

        # Filter out already liked songs
        liked_song_ids = {str(song["_id"]) for song in liked_songs}  # Convert ObjectId to string
        filtered_recommended_songs = [
            song for song in recommended_songs 
            if str(song["_id"]) not in liked_song_ids
        ]

        # Limit to top 12 recommendations
        top_recommendations = filtered_recommended_songs[:20]

        # Convert ObjectId to string
        recommended_songs_json = json.loads(json.dumps(top_recommendations, cls=JSONEncoder))

        return jsonify({"success": True, "recommended_songs": recommended_songs_json})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Get the port from environment variable
    app.run(host="0.0.0.0", port=port, debug=False)