import requests
import json
from collections import Counter
from datetime import datetime

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAPOh9QEAAAAAq89hJQK%2BQN8lRC0U3fvKqD3qq5w%3D9pEuf8Uu58lJn2RBgdXc4gaz3plQeeELEJ3bTQPgzUlUOX36Op"
USERNAME = "anilabz"
OUTPUT_FILE = "/Users/kaede/anitabi/anilab_結果.json"


def get_user_id(username: str) -> str:
    url = f"https://api.twitter.com/2/users/by/username/{username}"
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()["data"]["id"]


def fetch_tweets(user_id: str, max_results: int = 100) -> list[dict]:
    url = f"https://api.twitter.com/2/users/{user_id}/tweets"
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    params = {
        "max_results": min(max_results, 100),
        "tweet.fields": "created_at,entities,text",
        "expansions": "author_id",
    }

    tweets = []
    next_token = None

    while len(tweets) < max_results:
        if next_token:
            params["pagination_token"] = next_token

        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

        tweets.extend(data.get("data", []))

        next_token = data.get("meta", {}).get("next_token")
        if not next_token or len(tweets) >= max_results:
            break

    return tweets[:max_results]


def extract_hashtags(tweet: dict) -> list[str]:
    entities = tweet.get("entities", {})
    tags = entities.get("hashtags", [])
    return [f"#{t['tag']}" for t in tags]


def main():
    print(f"@{USERNAME} の投稿を取得中...")

    user_id = get_user_id(USERNAME)
    print(f"ユーザーID: {user_id}")

    tweets = fetch_tweets(user_id, max_results=100)
    print(f"{len(tweets)} 件取得完了")

    results = []
    all_hashtags = []

    for tw in tweets:
        tags = extract_hashtags(tw)
        all_hashtags.extend(tags)
        results.append({
            "id": tw["id"],
            "text": tw["text"],
            "created_at": tw.get("created_at", ""),
            "hashtags": tags,
        })

    hashtag_ranking = [
        {"hashtag": tag, "count": count}
        for tag, count in Counter(all_hashtags).most_common()
    ]

    print("\n===ハッシュタグ使用回数ランキング===")
    for i, entry in enumerate(hashtag_ranking[:20], 1):
        print(f"{i:2}. {entry['hashtag']} — {entry['count']}回")

    output = {
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "username": USERNAME,
        "tweet_count": len(results),
        "hashtag_ranking": hashtag_ranking,
        "tweets": results,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n結果を保存しました: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
