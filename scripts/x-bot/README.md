# AniTabi X Bot（Phase 1）

型A「今日の放送」と型B「今期注目」を、当日の日付から決定した昼・夜の2枠で投稿します。認証情報が1つでも不足している場合は自動でDRY_RUNになります。

## 環境変数

プロジェクト直下の `.env.local` に以下を設定します。

```dotenv
X_CONSUMER_KEY=
X_CONSUMER_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
X_BEARER_TOKEN=
```

## DRY_RUN

`--type` を付けると実行時刻を問わず、当日プランの該当型を確認できます。

```bash
npx tsx scripts/x-bot/post.ts --dry-run --type A
npx tsx scripts/x-bot/post.ts --dry-run --type B
```

`--dry-run` を省略しても、環境変数が不足している間は投稿されません。

## crontab設定例

cronのタイムゾーンを日本時間にし、候補5枠すべてで起動します。スクリプト側が当日選ばれた2枠だけを処理します。

```cron
CRON_TZ=Asia/Tokyo
30 7 * * * cd /Users/kaede/anitabi && npx tsx scripts/x-bot/post.ts >> scripts/x-bot/log/cron.log 2>&1
15 12 * * * cd /Users/kaede/anitabi && npx tsx scripts/x-bot/post.ts >> scripts/x-bot/log/cron.log 2>&1
0 18 * * * cd /Users/kaede/anitabi && npx tsx scripts/x-bot/post.ts >> scripts/x-bot/log/cron.log 2>&1
30 20 * * * cd /Users/kaede/anitabi && npx tsx scripts/x-bot/post.ts >> scripts/x-bot/log/cron.log 2>&1
30 22 * * * cd /Users/kaede/anitabi && npx tsx scripts/x-bot/post.ts >> scripts/x-bot/log/cron.log 2>&1
```

本番投稿に成功すると `scripts/x-bot/log/posts.jsonl` に投稿記録を追記します。指標取得の `getTweetsMetrics` は1回につき最大100件です。
