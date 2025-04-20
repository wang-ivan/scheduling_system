
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  function checkLogin() {
    let loggedIn = getCookie('loggedIn');
    if (!loggedIn) {
      window.location.href = 'login.html';
    }
  }
  
  // 在頁面加載時檢查登入狀態
  document.addEventListener("DOMContentLoaded", checkLogin);
  