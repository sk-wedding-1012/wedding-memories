# Wedding Memories サイト（ローカル開発環境）

## 起動

```
cd C:\資料\結婚式用資料\wedding-site
npm run dev
```

ブラウザで http://localhost:5173 を開く。ファイルを保存すると自動でリロードされます。

## フォルダ構成

```
wedding-site/
├─ config.js    … 名前・ムービー・式の流れ・エンドロールなどの設定（文章を変えるときはここだけ編集）
├─ index.html   … トップページ
├─ gallery.html … 写真ギャラリー（全写真・場面別タブ・60枚ずつ表示）
├─ assets/      … 共通のデザイン（style.css）と処理（common.js）
├─ photos/      … 元写真（PCにだけ置く・GitHubには上げない）
├─ sm/          … 一覧用の小さい版（長辺480px・自動生成）
├─ thumbs/      … 拡大表示の最初に出す版（長辺1000px・自動生成）
├─ large/       … 拡大表示・保存用（長辺2400px・自動生成）
├─ photos.js    … 写真リスト（自動生成）
├─ tools/       … build-photos.ps1（上の4つを作るスクリプト）
├─ server.js    … 依存なしの開発サーバー（自動リロード付き）
└─ package.json
```

## 写真の追加

1. `photos/` の中の場面フォルダに写真を置く（ファイル名はそのままでOK）

   | フォルダ | 場面 |
   |---|---|
   | `prep` | お支度 |
   | `meet` | ファーストミート |
   | `enter` | 挙式入場 |
   | `vows` | 誓い・指輪・証明書 |
   | `garden` | ガーデン |
   | `party` | 入場・乾杯 |
   | `flambe` | キッチンオープン |
   | `game` | ゲスト参加イベント |
   | `remake` | お色直し・デザート |
   | `thanks` | ご挨拶・花束 |
   | `farewell` | 門出・送賓 |

2. 次を実行すると `sm/` `thumbs/` `large/` `photos.js` が作り直される
   ```
   powershell -ExecutionPolicy Bypass -File tools\build-photos.ps1
   ```
3. 場面を変えたいときは、写真を別のフォルダへ移動して 2 を再実行
   - `photos/` 直下に置いた写真は「すべて」タブにだけ表示されます
   - サイトに載せない写真は `wedding-site` の外へ（今は `結婚式用資料\除外写真\` に移動済み）

## 公開（GitHub Pages）

変更したら次の1行で公開できます（CSS/JSの ?v= 番号の更新・コミット・プッシュをまとめて行います）。

```
powershell -ExecutionPolicy Bypass -File tools\publish.ps1 "変更内容のメモ"
```

### 手動でやる場合

写真を変えたら 2 を実行してから:

```n git add -A
git commit -m "写真を更新"
git push
```

数分でサイトに反映されます。
