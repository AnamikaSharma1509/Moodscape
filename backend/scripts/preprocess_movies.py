"""
Preprocess Movie Dataset and Cache TF-IDF Matrices
Usage: python preprocess_movies.py
"""
import os
import json
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

def preprocess():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    movies_path = os.path.join(data_dir, "movies.json")

    print(f"Loading raw movie data from {movies_path}...")
    with open(movies_path, "r", encoding="utf-8") as f:
        movies = json.load(f)

    df = pd.DataFrame(movies)
    print(f"Loaded {len(df)} movies.")

    corpus = []
    for _, row in df.iterrows():
        genres = " ".join(row.get("genres", []))
        moods = " ".join([t.split()[-1] for t in row.get("mood_tags", [])])
        cast = " ".join(row.get("cast", []))
        director = row.get("director", "")
        overview = row.get("overview", "")
        category = row.get("category", "")

        feature_text = f"{genres} {genres} {moods} {moods} {overview} {cast} {director} {category}".lower()
        corpus.append(feature_text)

    print("Fitting TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=2500,
        ngram_range=(1, 2)
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")

    # Save artifacts
    vec_path = os.path.join(data_dir, "tfidf_vectorizer.pkl")
    matrix_path = os.path.join(data_dir, "movie_vectors.pkl")
    csv_path = os.path.join(data_dir, "processed_movies.csv")

    with open(vec_path, "wb") as f:
        pickle.dump(vectorizer, f)

    with open(matrix_path, "wb") as f:
        pickle.dump(tfidf_matrix, f)

    df.to_csv(csv_path, index=False)
    print(f"Successfully saved preprocessing artifacts to {data_dir}!")

if __name__ == "__main__":
    preprocess()
