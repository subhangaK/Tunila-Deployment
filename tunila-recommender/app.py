from flask import Flask, request, jsonify
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
import json
from bson import ObjectId

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
            return jsonify({"success": False, "message": "No liked songs found."})

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
        recommended_indices = similarity_scores.mean(axis=0).argsort()[-10:][::-1]  # Top 10
        recommended_songs = [all_songs[i] for i in recommended_indices]

        # Convert ObjectId to string
        recommended_songs_json = json.loads(json.dumps(recommended_songs, cls=JSONEncoder))

        return jsonify({"success": True, "recommended_songs": recommended_songs_json})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)