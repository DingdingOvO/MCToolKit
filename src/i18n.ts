export type LangCode = 'zh_cn' | 'en_us' | 'zh_tw' | 'ja_jp' | 'ko_kr' | 'de_de' | 'fr_fr'

export interface UIStrings {
  siteName: string
  home: string
  items: string
  blocks: string
  sounds: string
  searchPlaceholder: string
  downloadAll: string
  downloadTexture: string
  close: string
  itemCount: string
  heroTitle: string
  heroSubtitle: string
  itemTextures: string
  blockTextures: string
  soundResources: string
  itemDesc: string
  blockDesc: string
  soundDesc: string
  comingSoon: string
  footer: string
}

const strings: Record<LangCode, UIStrings> = {
  zh_cn: {
    siteName: 'MCToolKit',
    home: '首页',
    items: '物品',
    blocks: '方块',
    sounds: '音效',
    searchPlaceholder: '搜索物品名称或 ID...',
    downloadAll: '下载全部结果',
    downloadTexture: '下载贴图',
    close: '关闭',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Minecraft 资源工具集',
    itemTextures: '物品贴图',
    blockTextures: '方块贴图',
    soundResources: '音效资源',
    itemDesc: '浏览 703 种物品贴图，支持 7 种语言搜索与下载',
    blockDesc: '浏览全部方块纹理，涵盖 1269 种方块资源',
    soundDesc: '4871 个游戏音效文件，在线试听与下载',
    comingSoon: '即将上线',
    footer: 'Minecraft 26.2 · 数据来源 Mojang Public API',
  },
  en_us: {
    siteName: 'MCToolKit',
    home: 'Home',
    items: 'Items',
    blocks: 'Blocks',
    sounds: 'Sounds',
    searchPlaceholder: 'Search by name or ID...',
    downloadAll: 'Download All',
    downloadTexture: 'Download',
    close: 'Close',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Minecraft Resource Toolkit',
    itemTextures: 'Item Textures',
    blockTextures: 'Block Textures',
    soundResources: 'Sound Resources',
    itemDesc: 'Browse 703 item textures with multilingual search',
    blockDesc: 'Browse 1269 block textures',
    soundDesc: '4871 game sounds, preview and download',
    comingSoon: 'Coming Soon',
    footer: 'Minecraft 26.2 · Data from Mojang Public API',
  },
  zh_tw: {
    siteName: 'MCToolKit',
    home: '首頁',
    items: '物品',
    blocks: '方塊',
    sounds: '音效',
    searchPlaceholder: '搜尋物品名稱或 ID...',
    downloadAll: '下載全部結果',
    downloadTexture: '下載貼圖',
    close: '關閉',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Minecraft 資源工具集',
    itemTextures: '物品貼圖',
    blockTextures: '方塊貼圖',
    soundResources: '音效資源',
    itemDesc: '瀏覽 703 種物品貼圖，支援 7 種語言搜尋與下載',
    blockDesc: '瀏覽 1269 種方塊紋理',
    soundDesc: '4871 個遊戲音效，線上試聽與下載',
    comingSoon: '即將上線',
    footer: 'Minecraft 26.2 · 資料來源 Mojang Public API',
  },
  ja_jp: {
    siteName: 'MCToolKit',
    home: 'ホーム',
    items: 'アイテム',
    blocks: 'ブロック',
    sounds: 'サウンド',
    searchPlaceholder: '名前やIDで検索...',
    downloadAll: '全件ダウンロード',
    downloadTexture: 'ダウンロード',
    close: '閉じる',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Minecraft リソースツールキット',
    itemTextures: 'アイテムテクスチャ',
    blockTextures: 'ブロックテクスチャ',
    soundResources: 'サウンドリソース',
    itemDesc: '703種のアイテムテクスチャを7言語で検索・ダウンロード',
    blockDesc: '1269種のブロックテクスチャを閲覧',
    soundDesc: '4871のゲームサウンド、試聴・ダウンロード',
    comingSoon: '近日公開',
    footer: 'Minecraft 26.2 · Mojang Public API',
  },
  ko_kr: {
    siteName: 'MCToolKit',
    home: '홈',
    items: '아이템',
    blocks: '블록',
    sounds: '소리',
    searchPlaceholder: '이름 또는 ID로 검색...',
    downloadAll: '전체 다운로드',
    downloadTexture: '다운로드',
    close: '닫기',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Minecraft 리소스 툴킷',
    itemTextures: '아이템 텍스처',
    blockTextures: '블록 텍스처',
    soundResources: '사운드 리소스',
    itemDesc: '703종 아이템 텍스처, 7개국어 검색 및 다운로드',
    blockDesc: '1269종 블록 텍스처 탐색',
    soundDesc: '4871개 게임 사운드, 미리듣기 및 다운로드',
    comingSoon: '출시 예정',
    footer: 'Minecraft 26.2 · Mojang Public API',
  },
  de_de: {
    siteName: 'MCToolKit',
    home: 'Start',
    items: 'Gegenstände',
    blocks: 'Blöcke',
    sounds: 'Sounds',
    searchPlaceholder: 'Nach Name oder ID suchen...',
    downloadAll: 'Alle herunterladen',
    downloadTexture: 'Herunterladen',
    close: 'Schließen',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Minecraft Ressourcen-Toolkit',
    itemTextures: 'Gegenstand-Texturen',
    blockTextures: 'Block-Texturen',
    soundResources: 'Sound-Ressourcen',
    itemDesc: '703 Gegenstand-Texturen, 7 Sprachen, Download',
    blockDesc: '1269 Block-Texturen durchsuchen',
    soundDesc: '4871 Game-Sounds, anhören und herunterladen',
    comingSoon: 'Demnächst',
    footer: 'Minecraft 26.2 · Mojang Public API',
  },
  fr_fr: {
    siteName: 'MCToolKit',
    home: 'Accueil',
    items: 'Objets',
    blocks: 'Blocs',
    sounds: 'Sons',
    searchPlaceholder: 'Rechercher par nom ou ID...',
    downloadAll: 'Tout télécharger',
    downloadTexture: 'Télécharger',
    close: 'Fermer',
    itemCount: '{count} / {total}',
    heroTitle: 'MCToolKit',
    heroSubtitle: 'Boîte à outils Minecraft',
    itemTextures: "Textures d'objets",
    blockTextures: 'Textures de blocs',
    soundResources: 'Ressources sonores',
    itemDesc: "Parcourir 703 textures d'objets, 7 langues",
    blockDesc: 'Parcourir 1269 textures de blocs',
    soundDesc: '4871 sons, écoute et téléchargement',
    comingSoon: 'Bientôt',
    footer: 'Minecraft 26.2 · Mojang Public API',
  },
}

export function t(lang: LangCode): UIStrings {
  return strings[lang]
}

export const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'zh_cn', label: '简体中文' },
  { code: 'en_us', label: 'English' },
  { code: 'zh_tw', label: '繁體中文' },
  { code: 'ja_jp', label: '日本語' },
  { code: 'ko_kr', label: '한국어' },
  { code: 'de_de', label: 'Deutsch' },
  { code: 'fr_fr', label: 'Français' },
]