

document.addEventListener('DOMContentLoaded', function() {
    // 獲取 DOM 元素
    const colorPicker = document.querySelector('.color-picker');
    const colorButton = document.querySelector('.color-button');
    const selectedColor = document.querySelector('.selected-color');
    // const colorMenu = document.querySelector('.color-menu');
    const colorOptions = document.querySelectorAll('.color-option');
    const colorInput = document.getElementById('color');
  
    // 切換選單顯示
    colorButton.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止默認行為
        e.stopPropagation(); // 阻止事件冒泡
        colorPicker.classList.toggle('open');
    });
  
    // 處理顏色選擇
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault(); // 阻止默認行為
            e.stopPropagation(); // 阻止事件冒泡
            
            // 更新按鈕顯示的顏色
            const color = option.getAttribute('data-color');
            selectedColor.style.backgroundColor = color;
            
            // 更新隱藏的輸入欄位值
            colorInput.value = color;
            
            // 關閉選單
            colorPicker.classList.remove('open');
        });
    });
  
    // 點擊其他地方時關閉選單
    document.addEventListener('click', (e) => {
        if (!colorPicker.contains(e.target)) {
            colorPicker.classList.remove('open');
        }
    });
  });