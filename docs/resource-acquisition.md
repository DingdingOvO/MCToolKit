# MCToolKit - Minecraft 资源获取指南

本文档记录 Minecraft 26.2 全部资源文件的获取方法与流程。

---

## 一、版本清单 API

Mojang 提供公开的版本元数据 API，无需认证。

### 1.1 获取版本清单

```bash
curl -s https://piston-meta.mojang.com/mc/game/version_manifest_v2.json
```

返回结构：

```json
{
  "latest": {
    "release": "26.2",
    "snapshot": "26.3-snapshot-10"
  },
  "versions": [
    {
      "id": "26.2",
      "type": "release",
      "url": "https://piston-meta.mojang.com/v1/packages/{hash}/{version}.json",
      "time": "...",
      "releaseTime": "..."
    }
  ]
}
```

- `versions[0]` 始终为最新版本（可能是 snapshot）
- 通过 `type: "release"` 筛选正式版
- `latest.release` 直接指向最新正式版 ID

### 1.2 获取指定版本详情

```bash
# 从清单中找到版本 URL 后
curl -s https://piston-meta.mojang.com/v1/packages/{hash}/{version}.json
```

关键字段：

```json
{
  "id": "26.2",
  "downloads": {
    "client": { "sha1": "...", "size": 39193383, "url": "https://piston-data.mojang.com/v1/objects/{hash}/client.jar" },
    "server": { "sha1": "...", "size": 60894273, "url": "https://piston-data.mojang.com/v1/objects/{hash}/server.jar" }
  },
  "assetIndex": {
    "id": "32",
    "sha1": "0a7b601915914596801099f0522ad169a995b010",
    "size": 586366,
    "totalSize": 480049429,
    "url": "https://piston-meta.mojang.com/v1/packages/{hash}/32.json"
  },
  "libraries": [...]
}
```

---

## 二、客户端 JAR 下载与解压

### 2.1 下载 client.jar

```bash
# 直接用版本详情中的 downloads.client.url
curl -L -o minecraft-client-26.2.jar "https://piston-data.mojang.com/v1/objects/{hash}/client.jar"
```

### 2.2 解压提取资源

JAR 本质是 ZIP 文件，直接解压：

```bash
mkdir extracted
cd extracted
unzip ../minecraft-client-26.2.jar
```

### 2.3 JAR 内置资源结构

```
jar 内部:
├── assets/minecraft/
│   ├── textures/       # 3856 张纹理 PNG
│   ├── models/         # 方块/物品 3D 模型 JSON
│   ├── blockstates/    # 方块状态定义
│   ├── lang/           # 仅 en_us.json + deprecated.json
│   ├── texts/          # credits / splashes / end 文本
│   ├── font/           # 字体配置 JSON（非字体文件本身）
│   ├── shaders/        # GLSL 着色器
│   ├── particles/      # 粒子定义
│   ├── atlases/        # 纹理图集定义
│   ├── equipment/      # 装备定义
│   ├── items/          # 物品定义
│   ├── post_effect/    # 后处理效果
│   └── waypoint_style/ # 路点样式
├── data/minecraft/     # 39 个注册表目录
│   ├── recipe/         # 合成配方
│   ├── loot_table/     # 战利品表
│   ├── advancement/    # 进度
│   ├── structure/      # NBT 结构文件 (1212 个)
│   ├── enchantment/    # 附魔
│   ├── worldgen/       # 世界生成
│   └── ...             # damage_type / dialog / tag 等
├── com/                # Java 类文件（代码，非资源）
├── net/                # Java 类文件（代码，非资源）
├── META-INF/           # 签名和清单（非资源）
├── pack.png            # 资源包图标
└── version.json        # 版本信息
```

### 2.4 清理非资源文件

```bash
rm -rf com/ net/ META-INF/ flightrecorder-config.jfc
```

---

## 三、CDN 资源索引与下载

JAR 内**不包含**音频文件和大部分语言文件。这些资源通过独立的 **Asset Index** 系统分发。

### 3.1 获取资源索引

```bash
# 用版本详情中 assetIndex.url
curl -s -o asset-index-32.json "https://piston-meta.mojang.com/v1/packages/{hash}/32.json"
```

索引结构：

```json
{
  "objects": {
    "minecraft/sounds/ambient/cave/cave1.ogg": {
      "hash": "a1b2c3...",
      "size": 12345
    },
    "minecraft/lang/zh_cn.json": {
      "hash": "d4e5f6...",
      "size": 67890
    }
  }
}
```

### 3.2 CDN 下载 URL 规则

```
https://resources.download.minecraft.net/{hash 前 2 位}/{完整 hash}
```

示例：

```
hash = "a1b2c3d4e5f6..."
URL  = "https://resources.download.minecraft.net/a1/a1b2c3d4e5f6..."
```

### 3.3 索引中的资源分布

| 路径前缀 | 文件数 | 说明 |
|----------|--------|------|
| `minecraft/sounds/` | 4871 OGG | 全部游戏音效 |
| `minecraft/sounds.json` | 1 | 音效注册表（事件名到文件映射） |
| `minecraft/lang/` | 142 JSON | 全部语言包 |
| `minecraft/font/` | 5 | Unicode 字体文件（unifont.zip 等） |
| `minecraft/textures/` | 7 | 额外纹理（与 JAR 内纹理互补） |
| `minecraft/resourcepacks/` | 2 | 内置资源包（程序员艺术 / 英文像素） |
| `realms/lang/` | 1 | Realms 语言文件 |
| `realms/textures/` | 15 | Realms 纹理 |
| `icons/` | 7 | 游戏图标（多尺寸 + macOS icns） |

### 3.4 文件存放路径映射

索引中的 key 到本地路径的映射规则：

| 索引 key | 本地路径 |
|----------|----------|
| `minecraft/xxx` | `assets/minecraft/xxx` |
| `realms/xxx` | `assets/realms/xxx` |
| `icons/xxx` | `icons/xxx` |

---

## 四、语言文件筛选策略

索引中共 142 个语言文件，本项目仅保留以下 7 种：

| 语言代码 | 语言 |
|----------|------|
| `zh_cn` | 简体中文 |
| `en_us` | English |
| `zh_tw` | 繁體中文 |
| `ja_jp` | 日本語 |
| `ko_kr` | 한국어 |
| `de_de` | Deutsch |
| `fr_fr` | Français |

其余 135 个语言文件跳过不下载。

---

## 五、完整自动化脚本

本项目提供了 Python 自动化下载脚本：`scripts/download_assets.py`

### 使用方法

```bash
# 1. 下载并解压 client.jar
mkdir -p assets/extracted
cd assets/extracted
unzip ../../minecraft-client-26.2.jar
rm -rf com/ net/ META-INF/ flightrecorder-config.jfc

# 2. 下载资源索引
curl -s -o ../asset-index/32.json "{assetIndex.url}"

# 3. 运行自动下载脚本（多线程 + SHA1 校验）
python3 scripts/download_assets.py
```

### 脚本特性

- 32 线程并发下载
- SHA1 哈希校验，确保文件完整
- 自动按语言白名单过滤
- 自动创建目录结构
- 实时进度输出

---

## 六、最终资源汇总

| 来源 | 类别 | 数量 | 大小 |
|------|------|------|------|
| JAR 解压 | 纹理 PNG | 3856 | ~ |
| JAR 解压 | 3D 模型 JSON | ~14000 | ~ |
| JAR 解压 | NBT 结构 | 1212 | ~ |
| JAR 解压 | 着色器 GLSL | 80 | ~ |
| JAR 解压 | 注册表 JSON | ~14000 | ~ |
| CDN 下载 | 音频 OGG | 4871 | ~ |
| CDN 下载 | 语言 JSON | 7 | ~ |
| CDN 下载 | 字体文件 | 5+3 ZIP | ~ |
| CDN 下载 | 图标/其他 | ~25 | ~ |
| **合计** | | **~39000+** | **~473 MB** |

---

## 七、API 速查

| 用途 | URL |
|------|-----|
| 版本清单 | `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json` |
| 版本详情 | `https://piston-meta.mojang.com/v1/packages/{hash}/{version}.json` |
| 客户端 JAR | `https://piston-data.mojang.com/v1/objects/{hash}/client.jar` |
| 服务端 JAR | `https://piston-data.mojang.com/v1/objects/{hash}/server.jar` |
| 资源索引 | `https://piston-meta.mojang.com/v1/packages/{hash}/{index_id}.json` |
| 资源文件 | `https://resources.download.minecraft.net/{hash[:2]}/{hash}` |