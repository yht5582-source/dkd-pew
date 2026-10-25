# DKD-PEW 評估工具

這是給 DKD / CKD 照護團隊使用的公開靜態網頁工具，包含三份彼此獨立的評估表：

- 病人自填評估：10 題 0-2 分，另含紅旗條件。
- 衛教師評估：DKD 特異風險因子 0-10 分。
- 營養師評估：依 PEW 四大類（ISRNM 2008）確認，四大類中 3 類以上陽性支持 DKD-PEW；CRP、碳酸氫根、胃腸症狀、過度飲食限制列為「輔助」病因因子，不計入類別陽性。

本工具在瀏覽器本機運算，不會上傳個案資料；已填內容僅暫存於瀏覽器 localStorage，共用電腦用畢請按「清除」。臨床使用時請依院內規範保存紀錄。

## 公開網址

https://yht5582-source.github.io/dkd-pew/

## 開發

- 檔案：`app-data.js`（題目與標準）、`app-utils.js`、`app-render.js`、`app-logic.js`（計分與判讀）、`app.js`（啟動）。
- 測試：`node tests.cjs`

## 參考

- National Kidney Foundation KDOQI Clinical Practice Guideline for Nutrition in CKD: 2020 Update
- Fouque D, et al. A proposed nomenclature and diagnostic criteria for protein-energy wasting in acute and chronic kidney disease (ISRNM). Kidney Int 2008;73:391-398
- Chen LK, et al. Asian Working Group for Sarcopenia: 2019 consensus update. J Am Med Dir Assoc 2020;21:300-307

## 免責

本表單為臨床篩檢與營養評估輔助工具，不取代醫師診斷。急性感染、心衰竭、水腫、肝病、腫瘤、近期住院或大量蛋白尿時，應由醫師與營養師共同判讀。
