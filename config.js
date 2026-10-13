/* =====================================================
   サイトの設定（ここを書き換える）。index.html と gallery.html の両方で使う
   ===================================================== */
const CONFIG = {
  nameA: "Groom",             // 新郎の名前（要確認：フルネーム/イニシャル/愛称）
  nameB: "Bride",             // 新婦の名前
  dateText: "2026 . 10 . 12",
  venueText: "ACCORD LAURIER",
  thanks: "お忙しい中ご列席くださり、本当にありがとうございました。\nあの日の景色を、ここにそっと残しておきます。",
  footText: "2026.10.12　Groom & Bride",
  zipUrl: "",                 // 写真まとめて保存用のGoogleドライブURL（なければ空）
  videoMode: "link",          // "link"=Googleドライブで開く（画質が良い） / "modal"=ページ上で再生（ドライブの埋め込みは画質が落ちる）
  slideSeconds: 4,            // スライドショーの切替秒数
  highlightCount: 12,         // トップページのフォト欄に出す枚数
  carouselCount: 12,          // 式の流れの各場面に出す枚数（残りは「もっと見る」でギャラリーへ）
};

// 動画：url にGoogleドライブの共有リンク（「リンクを知っている全員」）を入れる
const MOVIES = {
  opening: { title:"オープニングムービー「LOVE SYNC」", desc:"リズムゲーム風のオープニング映像", url:"https://drive.google.com/file/d/1wquaZTp3oqBS5t1DAMDdhtrKgHqeQWZE/view?usp=sharing", style:"sync" },
  profile: { title:"プロフィールムービー",               desc:"ドラクエ風・ふたりのこれまで",     url:"https://drive.google.com/file/d/1COxaFFNYu1JYIoZBVfWYRRc4nKk6OyX2/view?usp=sharing", style:"dq" },
  ending:  { title:"エンドロールムービー",               desc:"ご列席の皆さまへの感謝を込めて",   url:"https://drive.google.com/file/d/16G1g4jcuKUzzYhb8ngBkZcPXBsP0N3at/view?usp=sharing", style:"end" },
};

// 写真のシーン（タブ兼・式の流れの各場面）。id は photos/ の中のフォルダ名
const SCENES = [
  { id:"prep",     label:"お支度" },
  { id:"meet",     label:"ファーストミート" },
  { id:"enter",    label:"挙式入場" },
  { id:"vows",     label:"誓い・指輪・証明書" },
  { id:"garden",   label:"ガーデン" },
  { id:"party",    label:"入場・乾杯" },
  { id:"flambe",   label:"キッチンオープン" },
  { id:"game",     label:"ゲスト参加イベント" },
  { id:"remake",   label:"リメイク・デザート" },
  { id:"thanks",   label:"ご挨拶・花束" },
  { id:"farewell", label:"門出・送賓" },
];

// 式の流れ（式場の進行表をもとに作成。【要確認】は実際にどうなったか確認して直す）
// phase: 区切り見出し / movies: MOVIES のキー / scene: SCENES のid
const FLOW = [
  { phase:"Getting Ready", sub:"支度・挙式前", time:"6:20", title:"お支度", desc:"朝いちばんから、それぞれお支度スタート。", scene:"prep" },
  { time:"8:45", title:"ファーストミート・家族対面", desc:"挙式会場でふたりが初めて顔を合わせ、ご家族とも対面しました。", scene:"meet" },

  { phase:"Ceremony", sub:"人前式 10:00〜", time:"10:00", title:"新郎・新婦入場", desc:"ご両親に支度を整えてもらい、みなさまに見守られて入場しました。", scene:"enter" },
  { time:"10:05", title:"誓いの言葉・指輪の交換・結婚証明書", desc:"誓いのあと、指輪を交換。キーボードの結婚証明書をみなさまの前で完成させました。【要確認：誓い・キスの内容】", scene:"vows" },
  { time:"10:20", title:"ガーデン：シャワー・集合写真・ゲームタイム", desc:"リボン＆バブルシャワーで退場し、集合写真とストラックアウトで盛り上がりました。", scene:"garden" },

  { phase:"Wedding Party", sub:"ウェディングパーティ 10:45〜", time:"10:45", title:"オープニングムービー", desc:"手作りのリズムゲーム風ムービーで開宴。", movies:["opening"] },
  { time:"10:50", title:"入場・ウェルカムスピーチ・乾杯", desc:"新郎のスピーチのあと、みなさまと乾杯。", scene:"party" },
  { time:"11:15", title:"キッチンオープン・お写真タイム", desc:"新郎のフランベパフォーマンスでキッチンがオープン。料理長のメニュー紹介と撮影タイム。", scene:"flambe" },
  { time:"11:40", title:"ゲスト参加型イベント", desc:"ケーキの代わりに、みなさまと楽しんだ時間。【要確認：実際の内容】", scene:"game" },
  { time:"11:55", title:"中座・プロフィールムービー", desc:"ふたりが中座している間に、ふたりのこれまでをドラクエ風に紹介。", movies:["profile"] },
  { time:"12:20", title:"リメイク入場・デザートビュッフェ", desc:"ガーデンでデザートビュッフェ。コーヒーや紅茶とともに。", scene:"remake" },
  { time:"13:00", title:"テーブルインタビュー・お手紙・花束・謝辞", desc:"ご両親へ感謝を伝え、花束と記念品をお渡ししました。", scene:"thanks" },
  { time:"13:20", title:"エンドロール・門出・送賓", desc:"エンドロールのあと、みなさまをお見送りしました。", movies:["ending"], scene:"farewell" },
];

// キャプションを付けたい写真は "フォルダ/ファイル名":"文章" を足す
const CAPS = { /* "enter/S__18169879_0.jpg": "入場" */ };

// エンドロール（役割と名前。【要確認】実際のエンドロールに合わせる）
const CREDITS = [
  { role:"Bride & Groom",   names:["Groom","Bride"] },
  { role:"Opening Movie",   names:["LOVE SYNC"] },
  { role:"Profile Movie",   names:["ドラクエ風プロフィールムービー"] },
  { role:"Special Thanks",  names:["ご列席の皆さま","ご家族の皆さま","式場スタッフの皆さま"] },
];
const CREDIT_LAST = "Thank you for being part of our day.";
