# `00_teaching` 講義閱讀索引

本資料夾收錄的是本專案的課堂講義、版本說明與補充文件。  
建議不要直接照檔名字面順序亂讀，而是依照下面的主線閱讀。

---

## 1. 主線閱讀順序

若是第一次閱讀這組教材，建議依序閱讀：

1. [00_專案迭代講義.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/00_專案迭代講義.md:1)
   用來理解整個專案從 V1 到 V9 的版本脈絡與演進理由。

2. [01_版本閱讀指南.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/01_版本閱讀指南.md:1)
   用來理解這個專案如何對照不同版本快照檔，避免讀 code 時迷路。

3. [01_前端分離開發、整合進後端的作法.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/01_前端分離開發、整合進後端的作法.md:1)
   用來理解本專案目前的前後端開發與部署方式。

4. [02_0_API contract truth 的重要性與實作方式.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/02_0_API contract truth 的重要性與實作方式.md:1)
   進入 API contract 主題，理解為什麼要先固定 API 邊界。

5. [02_1_從目前 backend.ts 補齊 Elysia route schema 的實作步驟清單.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/02_1_從目前 backend.ts 補齊 Elysia route schema 的實作步驟清單.md:1)
   把 API contract truth 真正落到 route schema。

6. [02_2_導入 OpenAPI ／ Swagger 輸出.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/02_2_導入 OpenAPI ／ Swagger 輸出.md:1)
   把 route schema 輸出成可閱讀、可驗證的 API 文件。

7. [03_為什麼這個專案選 Drizzle + Neon.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/03_為什麼這個專案選 Drizzle + Neon.md:1)
   說明為什麼資料層升級選擇 `Drizzle + Neon`。

8. [03_1_Drizzle+Neon_註冊與升級實作步驟清單.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/03_1_Drizzle+Neon_註冊與升級實作步驟清單.md:1)
   正式進入 V8 的資料庫升級實作。

9. [04_Elysia + Better Auth + Google provider 實作步驟清單.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/04_Elysia + Better Auth + Google provider 實作步驟清單.md:1)
   當 V8 完成後，再進入 V9 的 auth 升級。

---

## 2. 補充閱讀

以下文件偏向特定版本或特定問題的補充說明：

- [90_V3_normalizeMenuItem_相容舊資料說明.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/90_V3_normalizeMenuItem_相容舊資料說明.md:1)
  補充 V3 中 `normalizeMenuItem()` 的相容舊資料設計。

- [91_V5_V6_差異與決策說明.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/91_V5_V6_差異與決策說明.md:1)
  補充 V5 與 V6 的差異與教學決策邏輯。

---

## 3. 封存與導向

- [02_2_導入 OpenAPI ／ Swagger 輸出_01.md](/root/00_nsPrj/01_backEnd/06_elysia/00_demo01/00_teaching/02_2_導入 OpenAPI ／ Swagger 輸出_01.md:1)
  這是舊副本保留用的封存導向頁，正式內容請以 `02_2_導入 OpenAPI ／ Swagger 輸出.md` 為準。

---

## 4. 使用建議

1. 若是第一次接觸本專案，先看「主線閱讀順序」。
2. 若是要回頭查某一版為什麼這樣改，再看補充閱讀。
3. 若是從舊連結跳到帶 `_01` 的檔案，先確認它是不是封存頁。
