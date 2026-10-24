# おやこ旅支度

マレーシアへの親子留学の準備を手伝う、日本語のスマホ向けPWAです。

## 使える機能

- 滞在期間・母親の過ごし方・子どもの年齢・運転予定によるタスクの分岐
- 出発予定日からの期限の逆算（すべて目安。申請先の締切を優先）
- 完了チェック、カテゴリー別の進捗、未完了・完了による絞り込み
- 回答と進捗のブラウザ内保存。プランを変更しても完了履歴を保持
- 本番ビルドで初回読み込み後のオフライン利用

最初は約1年・付き添い・未就学児と小学生の例が選択されています。出発日は未設定です。個人を特定する情報やパスポート番号は入力しません。端末間の同期はありません。ブラウザのデータを削除すると進捗も消えます。

## 開発

Node.js 22.12以上（この環境では24.19.0）、npmを利用します。

```sh
cd /workspace/oyako-ryugaku-app
npm ci --cache=/tmp/oyako-npm-cache
npm run dev -- --port 5173
```

## 検証と本番ビルド

```sh
npm test
npm run build
npm run test:e2e
npm run preview -- --port 4173
```

ブラウザテストはこのクラウド環境の `/usr/bin/chromium` を使用します。他の環境では `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` にインストール済みChromiumのパスを設定してください。

## チェックリストを更新する

`public/tasks.json` の各項目を編集します。`category` は0〜5、`daysBefore` は出発からさかのぼる日数、`conditions` は表示条件（省略すると全家庭向け）です。

- duration: short / year / move
- activity: guardian / work / nomad / study
- children: preschool / elementary / secondary（複数選択）
- driving: yes / no

`sourceUrl` は確認窓口へのリンクです。添付メモをもとにした初期データのため、公式サイトでの最新情報の照合は未実施です。`lastVerified` は未確認を表すnull、`status` はneeds-reviewとしています。確認日を推測で入力しないでください。法的助言や申請可否の判定を提供するものではありません。

## 公開・PWA

`dist/` をHTTPS対応の静的ホスティングに配置します。ルートパスへの配置を想定しています。HTTPSがサービスワーカーに必要です（開発用のループバックは例外）。初回はオンラインで開き、その後に同じ端末でオフライン利用できます。ブラウザの「ホーム画面に追加」等からインストールできますが、対応は端末・ブラウザによります。

サービスワーカーは同一オリジンの取得成功レスポンスをキャッシュします。リリース時は `public/sw.js` のキャッシュバージョンを更新してください。開発モードのソースファイルはオフライン保証の対象外です。通知、クラウド同期、アカウント、他国への対応、公開先へのデプロイは含みません。

## スマホからGitHub Pagesで公開する

`.github/workflows/pages.yml` はmainブランチの更新時と手動実行時にGitHub Pagesへ公開します。GitHubのリポジトリ画面で Settings → Pages → Source を GitHub Actions に設定してください。公開するとアプリと初期タスク情報は誰でも閲覧できますが、回答・進捗は各端末だけに保存されます。非公開リポジトリでのPages利用可否はGitHubの契約に依存します。

GitHub Pagesのサブパスに対応するため `APP_BASE_PATH=/oyako-ryugaku-app/ npm run build` でビルドします。通常のホスティング向けには環境変数なしの `npm run build` を使用します。
