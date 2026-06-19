from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from collections import Counter
import random

# Download vader_lexicon on startup if not present
try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

app = FastAPI()
sia = SentimentIntensityAnalyzer()

class ReviewPayload(BaseModel):
    reviews: List[str]

# Simple stop words list for keyword extraction without heavy dependencies
STOP_WORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", 
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", 
    "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", 
    "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", 
    "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", 
    "for", "with", "about", "against", "between", "into", "through", "during", "before", 
    "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", 
    "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", 
    "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", 
    "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", 
    "just", "don", "should", "now", "get", "got", "like", "really", "would", "could", "much", 
    "even", "also", "made", "make", "went", "came", "done", "say", "said", "one", "two", "us"
])

def extract_keywords(reviews_text: List[str], sentiment_scores: List[float]) -> Dict[str, str]:
    positive_words = []
    negative_words = []
    
    for text, score in zip(reviews_text, sentiment_scores):
        # Extract words longer than 3 chars
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        meaningful_words = [w for w in words if w not in STOP_WORDS]
        
        if score > 0.3:
            positive_words.extend(meaningful_words)
        elif score < -0.3:
            negative_words.extend(meaningful_words)
            
    top_asset = "General Service"
    friction_point = "None"
    
    if positive_words:
        top_asset_counter = Counter(positive_words).most_common(1)
        if top_asset_counter:
            top_asset = top_asset_counter[0][0].title()
            
    if negative_words:
        friction_counter = Counter(negative_words).most_common(1)
        if friction_counter:
            friction_point = friction_counter[0][0].title()
            
    # Randomize the output strings so they don't look identical across salons
    best_for_templates = [
        "Highly praised for {asset}",
        "Customers love the {asset}",
        "Known for excellent {asset}",
        "Top-rated for {asset}",
        "Standout feature: {asset}"
    ]
    
    watch_out_templates = [
        "Customers occasionally mentioned {friction}",
        "Some complaints regarding {friction}",
        "Watch out for {friction}",
        "A few reviews flagged {friction}",
        "Needs improvement on {friction}"
    ]

    # Generate generic growth suggestion based on friction point
    suggestion = random.choice([
        "Keep up the great work! Customers appreciate the high standards.",
        "Your customers are loving the vibe. Stay consistent!",
        "Great overall sentiment. Keep focusing on quality service."
    ])
    if friction_point != "None":
        if friction_point.lower() in ["wait", "time", "hours", "late", "delay"]:
            suggestion = random.choice([
                "Wait times are causing friction. Recommend increasing staff during peak hours.",
                "Customers are noticing delays. Consider optimizing your scheduling system.",
                "Long wait times spotted. Try streamlining your booking slots."
            ])
        elif friction_point.lower() in ["price", "cost", "expensive", "money"]:
            suggestion = random.choice([
                "Pricing is a concern. Consider offering loyalty packages.",
                "Some feel it's overpriced. Transparent pricing breakdowns might help.",
                "Cost is creating friction. A first-time discount could offset this."
            ])
        elif friction_point.lower() in ["staff", "rude", "attitude", "unprofessional"]:
            suggestion = random.choice([
                "Staff behavior was mentioned negatively. Recommend brief customer service training.",
                "Attitude issues spotted in reviews. A quick team alignment meeting might help.",
                "Customer service needs a boost based on recent feedback."
            ])
        else:
            suggestion = random.choice([
                f"Consider reviewing processes related to '{friction_point}' to improve satisfaction.",
                f"Pay close attention to feedback regarding '{friction_point}'.",
                f"There's room for improvement when it comes to '{friction_point}'."
            ])
            
    final_top_asset = random.choice(best_for_templates).format(asset=top_asset) if top_asset != "General Service" else "Consistent quality and service"
    final_friction = random.choice(watch_out_templates).format(friction=friction_point) if friction_point != "None" else "Nothing major to watch out for."

    return {
        "topAsset": final_top_asset,
        "frictionPoint": final_friction,
        "growthSuggestion": suggestion
    }

@app.post("/api/analyze")
def analyze_reviews(payload: ReviewPayload):
    total_reviews = len(payload.reviews)
    
    if total_reviews == 0:
         return {
            "totalAnalyzed": 0,
            "sentiment": { "good": 0, "neutral": 0, "bad": 0 },
            "authenticity": { "real": 0, "suspicious": 0 },
            "insights": {
                "topAsset": "Gather more reviews to generate highlights.",
                "frictionPoint": "Nothing major to watch out for.",
                "growthSuggestion": "Gather more reviews to generate insights."
            }
        }
    
    good_count = 0
    neutral_count = 0
    bad_count = 0
    
    suspicious_count = 0
    
    sentiment_scores = []
    seen_texts = set()

    for review in payload.reviews:
        # --- 1. Authenticity Heuristics ---
        is_suspicious = False
        
        # Rule 1: Exact Duplicate Text (Bot spam)
        if review in seen_texts:
            is_suspicious = True
        else:
            seen_texts.add(review)
            
        # Rule 2: Excessive repeated characters (e.g., AMAZINGGGGGG)
        if re.search(r'(.)\1{4,}', review):
            is_suspicious = True
            
        # Rule 3: All caps spam (if length > 10 and mostly uppercase)
        if len(review) > 10 and sum(1 for c in review if c.isupper()) / len([c for c in review if c.isalpha()] or [1]) > 0.8:
            is_suspicious = True
            
        # Rule 4: Suspiciously short (under 3 words)
        words = review.split()
        if len(words) <= 3:
            is_suspicious = True
            
        if is_suspicious:
            suspicious_count += 1
            
        # --- 2. Sentiment Analysis ---
        scores = sia.polarity_scores(review)
        compound = scores['compound']
        sentiment_scores.append(compound)
        
        if compound >= 0.05:
            good_count += 1
        elif compound <= -0.05:
            bad_count += 1
        else:
            neutral_count += 1

    # --- 3. Insights Extraction ---
    insights = extract_keywords(payload.reviews, sentiment_scores)

    return {
        "totalAnalyzed": total_reviews,
        "sentiment": {
            "good": round((good_count / total_reviews) * 100),
            "neutral": round((neutral_count / total_reviews) * 100),
            "bad": round((bad_count / total_reviews) * 100)
        },
        "authenticity": {
            "real": round(((total_reviews - suspicious_count) / total_reviews) * 100),
            "suspicious": round((suspicious_count / total_reviews) * 100)
        },
        "insights": insights
    }
