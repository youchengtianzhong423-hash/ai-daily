# AIデイリー

動画づくりに関係するAIニュースを、毎朝3本ほど（多い日で5本まで）、初心者にも分かる言葉で解説するWebアプリです。
記事はAIが自動で作成しています。内容の正確さは、各記事の出典でご確認ください。

## 仕組み
1. 毎朝、クラウド上のAIが `WRITING_GUIDE.md` に沿って `issues/日付/issue.json` を作る
2. `build.py` が全号を `data.js` にまとめる
3. GitHub Pages が公開する

保存・既読の記録は、読んでいる人のブラウザの中にだけ残ります。

## ファイル
| ファイル | 役目 |
|---|---|
| `issues/日付/issue.json` | その日の記事 |
| `WRITING_GUIDE.md` | 記事の書き方 |
| `build.py` | 全号を `data.js` にまとめる |
| `data.js` | 画面が読むデータ（自動生成。手で直さない） |
| `index.html` / `app.js` / `style.css` | 画面 |
