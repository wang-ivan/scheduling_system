

document.addEventListener("DOMContentLoaded", () => {
  db = window.db; // 確保 DOM 已加載後訪問
});


var ref = db.collection('login');

ref.get().then(querySnapshot => {
  querySnapshot.forEach(doc => {
    a = (doc.id, doc.data());
  });
});


// 登入表單處理
function login() {
  var account = document.forms["form"]["email"].value;
  var password = document.forms["form"]["password"].value;

  if (account != a['account']) {
    document.getElementById('account-error').innerHTML = `<p style="color:red;"><i class="bi bi-exclamation-triangle"></i> 帳號錯誤</p>`;
  }

  if (account == a['account']) {
    document.getElementById('account-error').innerHTML = `<p>&nbsp;</p>`;
    if (password != a['password']) {
      document.getElementById('password-error').innerHTML = `<p style="color:red;"><i class="bi bi-exclamation-triangle"></i> 密碼錯誤</p>`;
    } else if (password == a['password']) {
      setCookie('loggedIn', 'true', 12);
      window.location.href = 'studentData.html';
    }
  }
}



// 設置 cookie 的函數
function setCookie(name, value, hours) {
  let expires = "";
  if (hours) {
    let date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
