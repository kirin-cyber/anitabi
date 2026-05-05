import requests
import json
import re
import os
from bs4 import BeautifulSoup
from datetime import datetime

DATE_STR    = datetime.now().strftime("%Y-%m-%d")
IMAGE_DIR   = f"/Users/kaede/Documents/AniTabi_データ/ranking_images/{DATE_STR}"
OUTPUT_JSON = f"/Users/kaede/Documents/AniTabi_データ/ranking_images/{DATE_STR}/ranking_{DATE_STR}.json"
OUTPUT_TXT  = f"/Users/kaede/Documents/AniTabi_データ/ranking_images/{DATE_STR}/ranking_{DATE_STR}.txt"


def safe_filename(rank_prefix: str, title: str) -> str:
    """ファイル名に使えない文字を除去"""
    clean = re.sub(r'[\\/:*?"<>|]', "_", title)
    clean = clean[:40].strip()
    return f"{rank_prefix}_{clean}"


def download_image(url: str, filepath: str) -> bool:
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        with open(filepath, "wb") as f:
            f.write(resp.content)
        return True
    except Exception as e:
        print(f"    ⚠️ DL失敗: {filepath} ({e})")
        return False


def fetch_mal_ranking(limit: int = 10) -> list[dict]:
    """MyAnimeList トップエアリング（海外スコア順）"""
    url = "https://myanimelist.net/topanime.php?type=airing"
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
    resp = requests.get(url, headers=headers, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    results = []
    for i, row in enumerate(soup.select(".ranking-list")[:limit], 1):
        title_el = row.select_one("h3 a")
        score_el = row.select_one(".score-label")
        img_el   = row.select_one("img[data-src], img[src]")
        img_url  = ""
        if img_el:
            img_url = img_el.get("data-src") or img_el.get("src") or ""

        results.append({
            "rank": i,
            "title": title_el.get_text(strip=True) if title_el else "?",
            "score": score_el.get_text(strip=True) if score_el else "-",
            "image_url": img_url,
            "image_file": "",
        })
    return results


def fetch_anilist_japan(limit: int = 10) -> list[dict]:
    """AniList 2026春アニメ 人気順（日本語タイトル＋カバー画像）"""
    query = """
    query {
      Page(page: 1, perPage: %d) {
        media(type: ANIME, sort: POPULARITY_DESC, status: RELEASING, season: SPRING, seasonYear: 2026) {
          title { romaji native english }
          popularity
          trending
          averageScore
          coverImage { large }
        }
      }
    }
    """ % limit
    resp = requests.post("https://graphql.anilist.co", json={"query": query}, timeout=15)
    resp.raise_for_status()
    items = resp.json()["data"]["Page"]["media"]

    results = []
    for i, m in enumerate(items, 1):
        results.append({
            "rank": i,
            "title_ja": m["title"]["native"] or "",
            "title_en": m["title"]["romaji"] or "",
            "score": m["averageScore"],
            "popularity": m["popularity"],
            "trending": m["trending"],
            "image_url": m["coverImage"]["large"] if m.get("coverImage") else "",
            "image_file": "",
        })
    return results


def download_all_images(mal: list[dict], anilist: list[dict]) -> None:
    os.makedirs(IMAGE_DIR, exist_ok=True)

    print("\n📥 MAL 画像ダウンロード中...")
    for entry in mal:
        if not entry["image_url"]:
            continue
        fname = safe_filename(f"global_{entry['rank']:02d}", entry["title"])
        ext   = ".jpg"
        fpath = os.path.join(IMAGE_DIR, fname + ext)
        ok    = download_image(entry["image_url"], fpath)
        if ok:
            entry["image_file"] = fpath
            print(f"  ✅ {fname}{ext}")

    print("\n📥 AniList 画像ダウンロード中...")
    for entry in anilist:
        if not entry["image_url"]:
            continue
        title = entry["title_ja"] or entry["title_en"]
        fname = safe_filename(f"japan_{entry['rank']:02d}", title)
        ext   = ".jpg"
        fpath = os.path.join(IMAGE_DIR, fname + ext)
        ok    = download_image(entry["image_url"], fpath)
        if ok:
            entry["image_file"] = fpath
            print(f"  ✅ {fname}{ext}")


def build_text(mal: list[dict], anilist: list[dict]) -> str:
    medals = {1: "🥇", 2: "🥈", 3: "🥉"}
    lines  = [
        "アニメランキングまとめ",
        f"取得日: {DATE_STR}",
        "",
        "=" * 36,
        "【海外】MyAnimeList トップエアリング TOP10",
        "=" * 36,
    ]
    for e in mal:
        m = medals.get(e["rank"], f'{e["rank"]:2}.')
        lines.append(f'{m} {e["title"][:32]:<32}  {e["score"]}点')

    lines += [
        "",
        "=" * 36,
        "【日本語】AniList 2026春アニメ 人気順 TOP10",
        "=" * 36,
    ]
    for e in anilist:
        m      = medals.get(e["rank"], f'{e["rank"]:2}.')
        score  = f'{e["score"]}点' if e["score"] else " - "
        lines.append(f'{m} {e["title_ja"][:22]:<22}  スコア:{score}  人気:{e["popularity"]:,}')

    lines += ["", f'画像保存先: {IMAGE_DIR}']
    return "\n".join(lines)


def main():
    os.makedirs(IMAGE_DIR, exist_ok=True)

    print("【海外】MyAnimeList を取得中...")
    mal = fetch_mal_ranking(limit=10)
    print(f"  → {len(mal)} 件取得")

    print("【日本語】AniList を取得中...")
    anilist = fetch_anilist_japan(limit=10)
    print(f"  → {len(anilist)} 件取得")

    download_all_images(mal, anilist)

    output = {
        "date": DATE_STR,
        "mal_top_airing": mal,
        "anilist_spring_2026_popular": anilist,
    }
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON: {OUTPUT_JSON}")

    text = build_text(mal, anilist)
    with open(OUTPUT_TXT, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"💾 TXT:  {OUTPUT_TXT}")

    print("\n" + text)


if __name__ == "__main__":
    main()
