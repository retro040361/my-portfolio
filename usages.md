  在 Markdown 文章中，要讓多張圖片在同一行（並排）顯示，為您提供了以下兩種極簡且方便的寫法：
  ──────
  ### 🌟 方式 1：純 Markdown 超 單寫法（推薦 🚀�）

  只要在 Markdown 中將圖片寫在同一行（中間用空格隔開，不要換行），系統就會自動識別並將它們排成一行並排（且手機端會自動適應適應）：

   <<!-- 一行 2 張圖片並排 -->
    ![圖1](/image/2025_recap/apr_1.jpg) ![圖2](/image/2025_recap/apr_2.jpg)

   <<!-- 一行 3 張圖片並排 -->
    ![圖1](/image/2025_recap/apr_1.jpg) ![圖2](/image/2025_recap/apr_2.jpg) ![圖3](/image/2025_recap/apr_3.jpg)
    ──────
  ### 🌟 方式 2：使用網格 HTML 容器語法

  如果您希望精準控制一行 固定要擺 2 張還是 3 張 可以直接在 Markdown 文章裡套用我們寫好的 .im g-grid-2 或 .img-grid-3 標籤：

  ####   一行 2 張圖片：

    <div class="img-grid-2">
      <img src="/image/2025_recap/apr_1.jpg" alt="基隆風景" />
      <img src="/image/2025_recap/apr_2.jpg" alt="九份芋圓" />
    </div>

  ####   一行 3 張圖片：

    <div class="img-grid-3">
      <img src="/image/2025_recap/apr_1.jpg" alt="圖1" />
      <img src="/image/2025_recap/apr_2.jpg" alt="圖2" />
      <img src="/image/2025_recap/apr_3.jpg" alt="圖3" />
    </div>
    ──────
  ### ✨ 排版視覺優化說明：

  • 自動等高與裁切 (object-fit: cover)：同一行的圖片會自動調整為相同的精緻高度與柔和圓角，不會因為圖片原始長寬比不同而歪歪斜斜。
  • 手機端自動適應：在手機小螢幕上，多圖並排會自動降級轉換為單欄展示，保證絕不超出螢幕。